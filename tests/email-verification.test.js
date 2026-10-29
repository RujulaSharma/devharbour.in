const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
process.env.NODE_ENV = 'test'; process.env.DB_PROVIDER = 'sqlite';
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'devharbour-email-'));
process.env.DB_PATH = path.join(directory, 'test.sqlite');
const app = require('../server/index'), database = require('../server/database');
const { createService, sendWithResend } = require('../server/email-verification');
const { createStore } = require('../server/email-verification-store');
const { hashPassword } = require('../server/auth');
let server, base, time = Date.now(), mail = [], deliveryFails = false, counter = 0;
const store = createStore(database);
const service = createService({ store, secret: 'a'.repeat(64), now: () => time,
  randomCode: () => '482915', isConfigured: () => true,
  sendMail: async message => { if (deliveryFails) throw Error('provider error with private details'); mail.push(message); } });
async function account(email = `email-fixture-${++counter}@example.test`) {
  const { salt, hash } = hashPassword('Isolated-fixture-password-6!');
  const user = await database.createUser({ email, username: `email_fixture_${++counter}`, fullName: 'Email Fixture', passwordHash: hash, salt });
  return { ...user, token: (await database.createSession(user.id)).token };
}
async function request(user, route, body, extra = {}) {
  const response = await fetch(base + route, { method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', ...(user ? { Authorization: `Bearer ${user.token}` } : {}), ...extra },
    body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: response.status, data: await response.json(), headers: response.headers };
}
test.before(async () => {

  database.db.prepare("INSERT INTO event_participants (id,event_slug,candidate_name,candidate_email,candidate_organisation,is_eligible) VALUES (?,?,?,?,?,1)").run(900002,'orca-coders-orcathon-2026','Verification Fixture','verified-participant@example.test','Test Organisation');
  app.locals.emailVerificationService = service;
  server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(async () => {
  server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); await database.close();
  assert.ok(path.resolve(directory).startsWith(path.resolve(os.tmpdir()) + path.sep + 'devharbour-email-'));
  fs.rmSync(directory, { recursive: true, force: true });
});
test('verification endpoints and own certificates require authentication', async () => {
  for (const route of ['/api/auth/email-verification', '/api/certificates/mine']) assert.equal((await request(null, route)).status, 401);
  assert.equal((await request(null, '/api/auth/email-verification/send', {})).status, 401);
});
test('supplied recipients and account identifiers cannot select another mailbox', async () => {
  const user = await account();
  for (const body of [{ email: 'victim@example.test' }, { userId: 'another' }, []])
    assert.equal((await request(user, '/api/auth/email-verification/send', body)).status, 400);
});
test('unverified user cannot read certificates even with a guessed registered email', async () => {
  const user = await account('verified-participant@example.test');
  assert.equal((await request(user, '/api/certificates/mine')).status, 403);
  assert.equal((await request(user, '/api/certificates/mine?email=someone@example.test')).status, 400);
});
test('codes are sent only to canonical own email, stored hashed, and absent from responses', async () => {
  const user = await account();
  const response = await request(user, '/api/auth/email-verification/send', {});
  assert.equal(response.status, 200); assert.equal(mail.at(-1).email, user.email);
  const row = await store.read(user.id); assert.notEqual(row.code_hash, '482915'); assert.equal(row.code_hash.length, 64);
  assert.equal(JSON.stringify(response.data).includes('482915'), false);
  const status = await request(user, '/api/auth/email-verification');
  assert.equal(status.headers.get('cache-control'), 'no-store'); assert.equal(status.data.verified, false);
  assert.equal('code_hash' in status.data, false);
  assert.equal((await request(user, '/api/auth/email-verification/send', {})).status, 429);
});
test('successful verification is one use and reused certificate never creates a duplicate', async () => {
  const user = await database.getUserByEmail('verified-participant@example.test');
  user.token = (await database.createSession(user.id)).token;
  const participant = await database.findParticipantByEmail(user.email);
  const certificate = await database.issueCertificate({ participantId: participant.id, recipientName: participant.candidate_name,
    recipientEmail: user.email, recipientOrganisation: 'Fixture', eventSlug: 'orca-coders-orcathon-2026', certificateType: 'Participation', issueDate: 'October 25, 2026' });
  const before = await database.countIssuedCertificates();
  await request(user, '/api/auth/email-verification/send', {});
  const result = await request(user, '/api/auth/email-verification/confirm', { code: '482915' });
  assert.equal(result.status, 200); assert.equal(result.data.verified, true);
  assert.equal((await store.read(user.id)).code_hash, null);
  for (let index = 0; index < 2; index++) {
    const mine = await request(user, '/api/certificates/mine'); assert.equal(mine.status, 200);
    assert.equal(mine.data.certificates[0].credential_id, certificate.credential_id);
    assert.equal('candidate_mobile' in mine.data.certificates[0], false);
  }
  assert.equal(await database.countIssuedCertificates(), before);
  const other = await account();
  assert.equal((await request(other, '/api/auth/email-verification/confirm', { code: '482915' })).status, 400);
  assert.equal((await request(other, '/api/certificates/mine')).status, 403);
  const sentBefore = mail.length; assert.equal((await service.send(user)).alreadyVerified, true); assert.equal(mail.length, sentBefore);
});
test('five failed attempts lock the code and concurrent attempts cannot exceed the limit', async () => {
  const user = await account(); await service.send(user);
  const results = await Promise.all(Array.from({ length: 9 }, () => service.confirm(user, '000000')));
  assert.ok(results.every(result => result.status === 400)); assert.equal((await store.read(user.id)).attempts, 5);
  assert.equal((await service.confirm(user, '482915')).status, 400);
});
test('expiry and resend invalidate old challenges', async () => {
  const user = await account(); await service.send(user); const old = await store.read(user.id);
  time += 600001; assert.equal((await service.confirm(user, '482915')).status, 400);
  await service.send(user); const next = await store.read(user.id);
  assert.notEqual(old.challenge_id, next.challenge_id); assert.notEqual(old.code_hash, next.code_hash);
});
test('concurrent resends reserve only one challenge and hourly limit survives requests', async () => {
  const user = await account(); const before = mail.length;
  await Promise.all(Array.from({ length: 4 }, () => service.send(user)));
  assert.equal(mail.length, before + 1);
  for (let index = 0; index < 4; index++) { time += 60001; assert.equal((await service.send(user)).sent, true); }
  time += 60001; assert.equal((await service.send(user)).status, 429);
  time += 3600001; assert.equal((await service.send(user)).sent, true);
});
test('delivery failures fail closed and never activate a code', async () => {
  const user = await account(); deliveryFails = true;
  const result = await service.send(user); deliveryFails = false;
  assert.equal(result.status, 503); assert.equal(result.error.includes('private'), false);
  assert.equal((await store.read(user.id)).state, 'failed'); assert.equal((await store.read(user.id)).code_hash, null);
  assert.equal((await service.confirm(user, '482915')).status, 400);
});
test('changed account email invalidates ownership proof', async () => {
  const user = await account(); await service.send(user); await service.confirm(user, '482915');
  assert.equal(await service.isVerified(user), true);
  assert.equal(await service.isVerified({ ...user, email: 'different@example.test' }), false);
});
test('verified unmatched email receives an honest no-match message without registry disclosure', async () => {
  const user = await account(); await service.send(user); await service.confirm(user, '482915');
  const mine = await request(user, '/api/certificates/mine'); assert.equal(mine.status, 200);
  assert.deepEqual(mine.data.certificates, []); assert.match(mine.data.message, /No eligible registration/);
  assert.equal(JSON.stringify(mine.data).includes('verified-participant'), false);
});
test('ineligible, revoked, and mismatched certificates are excluded', async () => {
  const user = await database.getUserByEmail('verified-participant@example.test'); user.token = (await database.createSession(user.id)).token;
  const participant = await database.findParticipantByEmail(user.email);
  for (const [sql, values, undo, undoValues] of [
    ['UPDATE event_participants SET is_eligible=0 WHERE id=?', [participant.id], 'UPDATE event_participants SET is_eligible=1 WHERE id=?', [participant.id]],
    ["UPDATE issued_certificates SET status='Revoked' WHERE participant_id=?", [participant.id], "UPDATE issued_certificates SET status='Valid' WHERE participant_id=?", [participant.id]],
    ["UPDATE issued_certificates SET recipient_email='someone@example.test' WHERE participant_id=?", [participant.id], 'UPDATE issued_certificates SET recipient_email=? WHERE participant_id=?', [user.email, participant.id]],
  ]) {
    database.db.prepare(sql).run(...values);
    assert.deepEqual((await request(user, '/api/certificates/mine')).data.certificates, []);
    database.db.prepare(undo).run(...undoValues);
  }
});
test('missing email configuration or migration fails closed without breaking existing authentication', async () => {
  const user = await account();
  const disabled = createService({ store, secret: '', isConfigured: () => false });
  assert.equal((await disabled.send(user)).status, 503);
  app.locals.emailVerificationService = createService({ store: { read() { throw Error('table missing'); } } });
  assert.equal((await request(user, '/api/auth/email-verification')).status, 503);
  assert.equal((await request(user, '/api/certificates/mine')).status, 503);
  assert.equal((await request(user, '/api/auth/me')).status, 200);
  app.locals.emailVerificationService = service;
});
test('real Resend transport is disabled under tests even when local secrets exist', async () => {
  await assert.rejects(() => sendWithResend({ email: 'nobody@example.test', code: '123456', challengeId: 'test' }), /EMAIL_NOT_CONFIGURED/);
});

test('legacy Vercel certificate handlers cannot bypass staff auth or forge credentials', async () => {
  const claim = require('../api/certificates/claim');
  const stats = require('../api/certificates/stats');
  const verify = require('../api/certificates/verify/[id]');
  const legacy = require('node:http').createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    req.query = Object.fromEntries(url.searchParams);
    if (url.pathname === '/claim') {
      // Emulate Vercel's pre-parsed request body as well as normal Express input.
      let body = ''; for await (const chunk of req) body += chunk;
      req.body = JSON.parse(body || '{}'); return claim(req, res);
    }
    if (url.pathname === '/stats') return stats(req, res);
    return verify(req, res);
  });
  legacy.listen(0, '127.0.0.1'); await new Promise(resolve => legacy.once('listening', resolve));
  const origin = `http://127.0.0.1:${legacy.address().port}`;
  try {
    const response = await fetch(origin + '/claim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'verified-participant@example.test' }) });
    assert.equal(response.status, 401); assert.equal(JSON.stringify(await response.json()).includes('recipient_email'), false);
    assert.equal((await fetch(origin + '/verify?id=0001')).status, 404);
    const counts = await (await fetch(origin + '/stats')).json(); assert.equal(counts.totalIssued, await database.countIssuedCertificates());
    const user = await database.getUserByEmail('verified-participant@example.test');
    const certificate = await database.getIssuedCertificateByEmail(user.email);
    assert.equal((await fetch(origin + '/verify?id=' + encodeURIComponent(certificate.credential_id))).status, 200);
    database.db.prepare("UPDATE issued_certificates SET status='Revoked' WHERE credential_id=?").run(certificate.credential_id);
    const revoked = await fetch(origin + '/verify?id=' + encodeURIComponent(certificate.credential_id));
    assert.equal(revoked.status, 410); assert.equal((await revoked.json()).verified, false);
    database.db.prepare("UPDATE issued_certificates SET status='Valid' WHERE credential_id=?").run(certificate.credential_id);
  } finally { legacy.closeAllConnections(); await new Promise(resolve => legacy.close(resolve)); }
});
