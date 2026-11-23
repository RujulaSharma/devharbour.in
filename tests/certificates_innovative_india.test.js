process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:';
process.env.EMAIL_VERIFICATION_SECRET = 'test-only-certificate-verification-secret';
const test = require('node:test');
const assert = require('node:assert/strict');
const { PDFDict, PDFDocument, PDFName } = require('pdf-lib');
const app = require('../server/index');
const db = require('../server/db');
const { generateCertificatePdf } = require('../server/certificate_generator');

test('Innovative India certificate flow', async t => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => server.close());
  const base = 'http://127.0.0.1:' + server.address().port;
  const details = '/api/certificates/my-certificate';
  const download = '/api/certificates/download/my-certificate';
  const preview = '/api/certificates/preview/my-certificate';
  const verify = '/api/certificates/innovative-india/verify/';
  const eventSlug = 'innovative-india-2026';
  const reserved = 'IN-26-0000042';
  const signupName = '  DÉV  शर्मा  Harbour  ';
  const request = (route, token, options = {}) => fetch(base + route, {
    ...options,
    headers: { ...(options.headers || {}), ...(token && { Authorization: 'Bearer ' + token }) }
  });
  const signup = async (username, fullName, { eligible = true, verified = true } = {}) => {
    const email = username + '@gmail.com';
    if (eligible) await db.insertParticipant({ eventSlug, candidateName: 'Roster name', candidateEmail: email });
    const response = await request('/api/auth/signup', null, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, username, email, password: 'A-test-password-123!' })
    });
    assert.equal(response.status, 201);
    const { token, user } = await response.json();
    if (verified) await db.markEmailVerified(user.id);
    return { email, passwordToken: token, token: (await db.createSession(user.id, email)).token, id: user.id };
  };
  const credential = async token => {
    const response = await request(details, token);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    return (await response.json()).credential;
  };

  await t.test('anonymous and invalid sessions cannot access any private endpoint', async () => {
    for (const path of [details, download, preview]) {
      assert.equal((await request(path)).status, 401);
      assert.equal((await request(path, 'invalid-token')).status, 401);
    }
  });

  let first;
  let second;
  await t.test('profile edits cannot overwrite the exact signup name or the imported ID', async () => {
    first = await signup('certificate_first', signupName);
    for (const endpoint of [details, preview, download]) {
      const denied = await request(endpoint, first.passwordToken);
      assert.equal(denied.status, 403);
      assert.equal((await denied.json()).requiresGoogle, true);
    }
    db.db.prepare('UPDATE event_participants SET certificate_credential_id = ? WHERE candidate_email = ?').run(reserved, first.email);
    await db.updateUserProfile(first.id, { fullName: 'Edited Profile Name' });
    assert.throws(() => db.db.prepare('UPDATE users SET certificate_name = ? WHERE id = ?').run('Changed', first.id), /immutable/);
    const cert = await credential(first.token);
    assert.equal(cert.recipient_name, signupName);
    assert.equal(cert.credential_id, reserved);
  });

  await t.test('concurrent requests issue one stable ID per eligible account', async () => {
    second = await signup('certificate_second', 'Second Participant');
    const third = await signup('certificate_third', 'Third Participant');
    const [a, b, aAgain, c, bAgain] = await Promise.all([second, third, second, first, third].map(user => credential(user.token)));
    assert.equal(a.credential_id, aAgain.credential_id);
    assert.equal(b.credential_id, bAgain.credential_id);
    assert.equal(c.credential_id, reserved);
    assert.equal(new Set([a.credential_id, b.credential_id, c.credential_id]).size, 3);
  });

  await t.test('long names render on one vector page with the original template dimensions', async () => {
    const pdf = await generateCertificatePdf({
      recipientName: 'Dr. Subramanian Ananthasubramanian Ramachandran-Bhattacharya '.repeat(2),
      credentialId: reserved
    });
    const document = await PDFDocument.load(pdf);
    assert.equal(document.getPageCount(), 1);
    const page = document.getPage(0);
    assert.deepEqual(page.getSize(), { width: 1080, height: 720 });
    const xObjects = page.node.Resources().lookupMaybe(PDFName.of('XObject'), PDFDict);
    assert.equal(xObjects?.entries().length ?? 0, 0);
  });

  await t.test('repeat downloads use the same printable PDF and permanent ID', async () => {
    const [one, two, inline] = await Promise.all([download, download, preview].map(route => request(route, first.token)));
    for (const response of [one, two, inline]) {
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('content-type'), 'application/pdf');
      assert.ok(response.headers.get('content-disposition').includes(reserved));
    }
    assert.match(one.headers.get('content-disposition'), /^attachment;/);
    assert.match(inline.headers.get('content-disposition'), /^inline;/);
    const [a, b, c] = await Promise.all([one, two, inline].map(async res => Buffer.from(await res.arrayBuffer())));
    assert.deepEqual(a, b);
    assert.deepEqual(a, c);
    assert.ok((await PDFDocument.load(a)).getTitle().endsWith(signupName));
  });

  await t.test('another authenticated participant cannot retrieve a different certificate', async () => {
    assert.equal((await request('/api/certificates/download/' + reserved, second.token)).status, 403);
    const response = await request(details + '?id=' + reserved + '&email=' + first.email, second.token);
    assert.notEqual((await response.json()).credential.credential_id, reserved);
  });

  await t.test('unverified, ineligible and legacy accounts cannot download', async () => {
    const unverified = await signup('certificate_unverified', 'Unverified Participant', { verified: false });
    const outsider = await signup('certificate_outsider', 'Outside Participant', { eligible: false });
    const legacy = await db.createUser({
      email: 'certificate_legacy@gmail.com', username: 'certificate_legacy',
      fullName: 'Mutable Profile', certificateName: null, passwordHash: 'fake', salt: 'fake'
    });
    await db.insertParticipant({ eventSlug, candidateName: 'Roster Name', candidateEmail: legacy.email });
    await db.markEmailVerified(legacy.id);
    const session = await db.createSession(legacy.id, legacy.email);
    assert.equal((await request(download, unverified.token)).status, 403);
    assert.equal((await (await request(details, outsider.token)).json()).eligible, false);
    assert.equal((await request(download, outsider.token)).status, 404);
    assert.equal((await request(details, session.token)).status, 409);
  });

  await t.test('verification checks the exact ID and hides private details', async () => {
    assert.equal((await request(verify + '42')).status, 400);
    assert.equal((await request(verify + 'IN-26-0000999')).status, 404);
    const verified = await (await request(verify + reserved)).json();
    assert.equal(verified.verified, true);
    assert.equal(verified.credential.event_name, 'Innovative India');
    assert.equal(verified.credential.credential_id, reserved);
    assert.ok(!('recipient_email' in verified.credential));
    assert.ok(!('recipient_name' in verified.credential));
    db.db.prepare("UPDATE issued_certificates SET status = 'Revoked' WHERE credential_id = ?").run(reserved);
    assert.equal((await (await request(verify + reserved)).json()).verified, false);
    assert.equal((await request(download, first.token)).status, 404);
  });
});
