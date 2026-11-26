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
  const signup = async (username, fullName, { eligible = true, verified = true, domain = 'gmail.com' } = {}) => {
    const email = username + '@' + domain;
    if (eligible) await db.insertParticipant({ eventSlug, candidateName: 'Roster name', candidateEmail: email });
    const response = await request('/api/auth/signup', null, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, username, email, password: 'A-test-password-123!' })
    });
    assert.equal(response.status, 201);
    const pending = await response.json();
    assert.equal(pending.requiresVerification, true);
    assert.equal(pending.token, undefined);
    const user = await db.getUserByEmail(email);
    if (verified) await db.markEmailVerified(user.id);
    return { email, passwordToken: (await db.createSession(user.id)).token, token: (await db.createSession(user.id, email)).token, id: user.id };
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

  await t.test('eligible profiles issue and display a stable certificate without a separate claim', async () => {
    const owner = await signup('certificate_profile', 'Profile Participant');
    const profile = '/api/profile/me/progress/';
    const user = await db.getUserById(owner.id);
    const progress = require('../server/profile/progress');
    assert.deepEqual(await progress.certificateList(user), []);
    assert.equal((await request(profile + 'certificates')).status, 401);
    const passwordOnly = await request(profile + 'certificates', owner.passwordToken);
    assert.equal(passwordOnly.status, 200);
    assert.deepEqual((await passwordOnly.json()).data, []);
    assert.equal((await db.getUserCertificates(owner.email)).length, 0);

    const responses = await Promise.all(['certificates', 'overview', 'certificates'].map(module => request(profile + module, owner.token)));
    for (const response of responses) assert.equal(response.status, 200);
    const [certificates, overview, repeated] = await Promise.all(responses.map(response => response.json()));
    assert.equal(certificates.data.length, 1);
    const certificate = certificates.data[0];
    assert.match(certificate.id, /^IN-26-\d{7}$/);
    assert.equal(certificate.title, 'Innovative India 2026');
    assert.equal(certificate.downloadUrl, '/innovative-certificate/');
    assert.equal(certificate.status, 'Valid');
    assert.equal(repeated.data[0].id, certificate.id);
    assert.equal(overview.data.certificates, 1);
    const issued = await db.getUserCertificates(owner.email);
    assert.equal(issued.length, 1);
    assert.equal(issued[0].owner_user_id, owner.id);
    assert.equal(issued[0].recipient_name, 'Profile Participant');
    assert.equal((await credential(owner.token)).credential_id, certificate.id);
  });

  await t.test('profile issuance requires the owner session, verification and the Innovative roster', async () => {
    const sync = require('../server/innovative_certificates').syncProfileCertificate;
    const owner = await signup('certificate_profile_guard', 'Guarded Participant');
    const outsider = await signup('certificate_profile_outsider', 'Outside Participant', { eligible: false });
    const unverified = await signup('certificate_profile_unverified', 'Unverified Participant', { verified: false });
    await db.insertParticipant({ eventSlug: 'orca-coders-orcathon-2026', candidateName: 'Other event', candidateEmail: outsider.email });
    await sync(owner.id, null);
    await sync(owner.id, 'invalid-token');
    await sync(owner.id, outsider.token);
    await sync(unverified.id, unverified.token);
    assert.equal((await db.getUserCertificates(owner.email)).length, 0);
    assert.equal((await db.getUserCertificates(unverified.email)).length, 0);
    const response = await request('/api/profile/me/progress/certificates?email=' + owner.email, outsider.token);
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).data, []);
    assert.equal((await db.getUserCertificates(outsider.email)).length, 0);
    assert.equal((await request('/api/profile/me/progress/certificates', unverified.token)).status, 403);
    db.db.prepare('UPDATE event_participants SET is_eligible=0 WHERE event_slug=? AND candidate_email=?').run(eventSlug, owner.email);
    await sync(owner.id, owner.token);
    assert.equal((await db.getUserCertificates(owner.email)).length, 0);
  });

  await t.test('verified non-Gmail participants see their certificate while public display stays opt-in', async () => {
    const owner = await signup('certificate_profile_private', 'Private Participant', { domain: 'example.test' });
    const before = await (await request('/api/profile/me', owner.passwordToken)).json();
    assert.equal(before.profile.visibility, 'private');
    assert.equal(before.profile.privacy.certificates, 'private');
    const certificateResponse = await request('/api/profile/me/progress/certificates', owner.passwordToken);
    assert.equal(certificateResponse.status, 200);
    const certificate = (await certificateResponse.json()).data[0];
    assert.match(certificate.id, /^IN-26-\d{7}$/);
    const after = await (await request('/api/profile/me', owner.passwordToken)).json();
    assert.deepEqual(after.profile, before.profile);
    const publicPath = '/api/profile/public/certificate_profile_private';
    assert.equal((await request(publicPath)).status, 404);
    const update = async (version, privacy) => {
      const response = await request('/api/profile/me', owner.passwordToken, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version, visibility: 'public', privacy: { certificates: privacy } })
      });
      assert.equal(response.status, 200);
      return (await response.json()).profile;
    };
    let profile = await update(after.profile.version, 'private');
    let publicProfile = await (await request(publicPath)).json();
    assert.equal(publicProfile.certificates, undefined);
    profile = await update(profile.version, 'public');
    publicProfile = await (await request(publicPath)).json();
    assert.equal(publicProfile.certificates[0].id, certificate.id);
    assert.ok(!JSON.stringify(publicProfile).includes(owner.email));
    await update(profile.version, 'private');
    publicProfile = await (await request(publicPath)).json();
    assert.equal(publicProfile.certificates, undefined);
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
    const profile = await request('/api/profile/me/progress/certificates', first.token);
    assert.equal((await profile.json()).data[0].id, reserved);
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
    await request('/api/profile/me/progress/certificates', first.token);
    assert.equal(db.db.prepare('SELECT status FROM issued_certificates WHERE credential_id=?').get(reserved).status, 'Revoked');
    assert.equal((await (await request(verify + reserved)).json()).verified, false);
    assert.equal((await request(download, first.token)).status, 404);
  });
});
