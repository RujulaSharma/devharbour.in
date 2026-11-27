process.env.NODE_ENV = 'test';
process.env.DB_PROVIDER = 'sqlite';
process.env.DB_PATH = ':memory:';
process.env.REDIS_URL = '';
const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../server/db');
const progress = require('../server/profile/progress');
const { syncProfileCertificates } = require('../server/profile/certificates');

test('Profile certificates and counters contain only the verified owner\'s valid eligible credentials', async t => {
  async function make(name, events) {
    const user = await db.createUser({ email: name + '@example.test', username: name,
      fullName: 'Same fixture name', passwordHash: 'fixture', salt: 'fixture' });
    await db.markEmailVerified(user.id);
    const { token } = await db.createSession(user.id);
    for (const eventSlug of events) await db.insertParticipant({ eventSlug,
      candidateEmail: user.email, candidateName: 'Same fixture name' });
    await syncProfileCertificates(user.id, token);
    return { ...user, token };
  }
  const orca = 'orca-coders-orcathon-2026', innovative = 'innovative-india-2026';
  const alice = await make('eligibility_alice', [orca, innovative]);
  const bob = await make('eligibility_bob', [innovative]);
  const original = await db.getUserCertificates(alice.email);
  assert.equal((await progress.certificateList(alice)).length, 2);
  assert.equal((await progress.overview(alice)).certificates, 2);

  await t.test('withdrawn eligibility hides an old valid record and removes it from the count', async () => {
    db.db.prepare('UPDATE event_participants SET is_eligible=0 WHERE event_slug=? AND candidate_email=?').run(innovative, alice.email);
    const list = await progress.certificateList(alice);
    assert.equal(list.length, 1);
    assert.equal(list[0].title, 'Orcathon 2026 — Participation');
    assert.equal((await progress.overview(alice)).certificates, 1);
    assert.equal((await db.getUserCertificates(alice.email)).length, 2, 'Historical records are preserved');
  });
  await t.test('an explicit conflicting owner cannot be projected onto the account', async () => {
    const orcaId = original.find(c => c.event_slug === orca).credential_id;
    db.db.prepare('UPDATE issued_certificates SET owner_user_id=? WHERE credential_id=?').run(bob.id, orcaId);
    assert.deepEqual(await progress.certificateList(alice), []);
    assert.equal((await progress.overview(alice)).certificates, 0);
    db.db.prepare('UPDATE issued_certificates SET owner_user_id=NULL WHERE credential_id=?').run(orcaId);
  });
  await t.test('revoked credentials are absent from both the list and its count', async () => {
    db.db.prepare("UPDATE issued_certificates SET status='Revoked' WHERE recipient_email=? AND event_slug=?").run(alice.email, orca);
    assert.deepEqual(await progress.certificateList(alice), []);
    assert.equal((await progress.overview(alice)).certificates, 0);
  });
  await t.test('query parameters and matching names cannot select another account\'s certificates', async () => {
    const app = require('../server/index');
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    try {
      const response = await fetch('http://127.0.0.1:' + server.address().port +
        '/api/profile/me/progress/certificates?email=' + encodeURIComponent(alice.email) + '&userId=' + alice.id,
        { headers: { Authorization: 'Bearer ' + bob.token } });
      assert.equal(response.status, 200);
      const { data } = await response.json();
      const bobIds = (await db.getUserCertificates(bob.email)).map(c => c.credential_id);
      assert.deepEqual(data.map(c => c.id), bobIds);
      assert(data.every(c => !original.some(a => a.credential_id === c.id)));
    } finally { await new Promise(resolve => server.close(resolve)); }
  });
});
