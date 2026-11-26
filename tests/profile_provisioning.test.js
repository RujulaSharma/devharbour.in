process.env.NODE_ENV = 'test';
process.env.DB_PROVIDER = 'sqlite';
process.env.DB_PATH = ':memory:';
process.env.REDIS_URL = '';
const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../server/db');
const store = require('../server/profile/store');
const { profilePrisma } = require('../server/profile/prisma');
const { backfillProfiles, accountFields } = require('../server/profile/provisioning');
const { syncProfileCertificates, backfillProfileCertificates } = require('../server/profile/certificates');

async function account(name, { verified = true, google = false } = {}) {
  const user = await db.createUser({ email: name + (google ? '@gmail.com' : '@example.test'),
    username: name, fullName: 'Original ' + name, location: 'New Delhi, India',
    bio: 'Saved before profiles existed', avatarUrl: 'https://example.test/avatar.png',
    passwordHash: 'fixture', salt: 'fixture' });
  await db.updateUserProfile(user.id, { githubUrl: 'https://github.com/' + name,
    portfolioUrl: 'https://example.test/' + name });
  if (verified) await db.markEmailVerified(user.id);
  const session = await db.createSession(user.id, google ? user.email : null);
  return { ...(await db.getUserById(user.id)), token: session.token };
}

test('Existing accounts receive persistent profiles without losing data or privacy', async t => {
  await backfillProfiles({ apply: true });
  const baselineProfiles = await profilePrisma().developerProfile.count();
  const existing = await account('already_profiled');
  await store.ensureSignupProfile(existing.id, { publicProfile: true });
  const saved = await store.save(existing.id, { version: 1, headline: 'Keep my edits',
    city: 'Mumbai', privacy: { certificates: 'private', location: 'private' },
    links: { github: '' } });
  const oldUser = await account('older_account');
  const before = await db.getUserById(oldUser.id);
  const settings = db.db.prepare('SELECT * FROM user_settings WHERE user_id=?').get(oldUser.id);
  const preview = await backfillProfiles();
  assert.deepEqual(preview, { missing: 1, created: 0 });
  assert.equal(await profilePrisma().developerProfile.count(), baselineProfiles + 1);
  assert.deepEqual(await backfillProfiles({ apply: true }), { missing: 1, created: 1 });
  assert.deepEqual(await backfillProfiles({ apply: true }), { missing: 0, created: 0 });
  const profile = await store.getProfile(oldUser.id);
  assert.equal(profile.city, before.location);
  assert.equal(profile.links.github, before.github_url);
  assert.equal(profile.links.portfolio, before.portfolio_url);
  assert.equal(profile.visibility, 'private');
  assert.equal(profile.discovery, false);
  assert.equal(profile.privacy.certificates, 'private');
  assert.equal(profile.details.allowResumeDownload, false);
  assert.equal(profile.version, 0);
  assert.deepEqual(await profilePrisma().developerProfile.findUnique({ where: { userId: existing.id } }), saved);
  assert.deepEqual(await db.getUserById(oldUser.id), before);
  assert.deepEqual(db.db.prepare('SELECT * FROM user_settings WHERE user_id=?').get(oldUser.id), settings);
  assert.equal((await store.getProfile(existing.id)).links.github, '');
  assert.equal((await store.access(oldUser, null)).read, false);
  await t.test('accounts missed by signup provisioning recover on first profile read', async () => {
    const late = await account('late_account');
    const profiles = await Promise.all([store.getProfile(late.id), store.getProfile(late.id)]);
    assert.equal(profiles[0].userId, late.id);
    assert.equal(profiles[1].city, late.location);
    assert.equal(await profilePrisma().developerProfile.count({ where: { userId: late.id } }), 1);
  });
  await t.test('unsafe legacy links are excluded; explicit profile fields win', () => {
    assert.deepEqual(accountFields({ github_url: 'javascript:alert(1)', portfolio_url: 'https://name:password@example.test' }).links, {});
  });
});

test('Owner profiles automatically receive every eligible event certificate', async t => {
  const app = require('../server/index');
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const owner = await account('both_events', { google: true });
  for (const eventSlug of ['orca-coders-orcathon-2026', 'innovative-india-2026']) {
    await db.insertParticipant({ eventSlug, candidateName: 'Approved Roster Name', candidateEmail: owner.email });
  }
  const base = 'http://127.0.0.1:' + server.address().port;
  const request = (path, token = owner.token) => fetch(base + path, { headers: token ? { Authorization: 'Bearer ' + token } : {} });
  const responses = await Promise.all(['certificates', 'overview', 'certificates'].map(module => request('/api/profile/me/progress/' + module)));
  for (const response of responses) assert.equal(response.status, 200);
  const data = await Promise.all(responses.map(response => response.json()));
  assert.equal(data[0].data.length, 2);
  assert.equal(data[1].data.certificates, 2);
  assert.deepEqual(data[0].data.map(c => c.id).sort(), data[2].data.map(c => c.id).sort());
  const issued = await db.getUserCertificates(owner.email);
  assert.equal(issued.find(c => c.event_slug === 'innovative-india-2026').recipient_name, owner.certificate_name);
  assert.equal(issued.find(c => c.event_slug === 'orca-coders-orcathon-2026').recipient_name, 'Approved Roster Name');
  const ownProfile = await (await request('/api/profile/me')).json();
  assert.equal(ownProfile.user.fullName, owner.full_name);
  assert.equal(ownProfile.user.bio, owner.bio);
  assert.equal(ownProfile.user.avatarUrl, owner.avatar_url);
  assert.equal(ownProfile.profile.city, owner.location);
  assert.equal((await request('/api/profile/public/' + owner.username, '')).status, 404);

  await t.test('invalid sessions, mismatched owners, unverified and ineligible accounts cannot issue', async () => {
    const unverified = await account('unverified_participant', { verified: false });
    const excluded = await account('ineligible_participant');
    await db.insertParticipant({ candidateName: 'Unverified', candidateEmail: unverified.email });
    await db.insertParticipant({ candidateName: 'Ineligible', candidateEmail: excluded.email, isEligible: 0 });
    await syncProfileCertificates(unverified.id, unverified.token);
    await syncProfileCertificates(unverified.id, owner.token);
    await syncProfileCertificates(excluded.id, excluded.token);
    await syncProfileCertificates(excluded.id, 'invalid');
    await syncProfileCertificates(excluded.id, null);
    assert.equal((await db.getUserCertificates(unverified.email)).length, 0);
    assert.equal((await db.getUserCertificates(excluded.email)).length, 0);
  });
  await t.test('reserved IDs and revoked certificates remain unchanged', async () => {
    const reserved = await account('reserved_orcathon');
    await db.insertParticipant({ candidateName: 'Reserved', candidateEmail: reserved.email });
    db.db.prepare('UPDATE event_participants SET certificate_credential_id=? WHERE candidate_email=?').run('DH-ORCA-PRESERVED', reserved.email);
    await syncProfileCertificates(reserved.id, reserved.token);
    const cert = (await db.getUserCertificates(reserved.email))[0];
    assert.equal(cert.credential_id, 'DH-ORCA-PRESERVED');
    db.db.prepare("UPDATE issued_certificates SET status='Revoked' WHERE credential_id=?").run(cert.credential_id);
    await syncProfileCertificates(reserved.id, reserved.token);
    assert.equal((await db.getUserCertificates(reserved.email))[0].status, 'Revoked');
  });
  await t.test('maintenance backfill keeps Google and original-name requirements and is idempotent', async () => {
    const ready = await account('ready_certificate', { google: true });
    const needsGoogle = await account('needs_google', { google: true });
    const needsName = await account('needs_name', { google: true });
    for (const user of [ready, needsGoogle, needsName]) {
      await db.insertParticipant({ eventSlug: 'innovative-india-2026', candidateName: 'Roster', candidateEmail: user.email });
    }
    db.db.prepare('UPDATE sessions SET google_verified_email=NULL WHERE user_id=?').run(needsGoogle.id);
    // Legacy accounts with no immutable original name require support verification.
    db.db.prepare('INSERT INTO users (id,email,username,full_name,password_hash,salt) VALUES (?,?,?,?,?,?)').run('legacy-name', 'legacy_name@example.test', 'legacy_name', 'Legacy', 'fixture', 'fixture');
    await db.markEmailVerified('legacy-name');
    await db.createSession('legacy-name');
    await db.insertParticipant({ eventSlug: 'innovative-india-2026', candidateName: 'Legacy', candidateEmail: 'legacy_name@example.test' });
    const preview = await backfillProfileCertificates();
    assert.equal(preview.ready, 2);
    assert.equal(preview.issued, 0);
    assert.equal(preview.awaitingSignIn, 1);
    assert.equal(preview.awaitingOriginalName, 1);
    assert.equal(preview.awaitingEmailVerification, 1);
    const applied = await backfillProfileCertificates({ apply: true });
    assert.equal(applied.issued, 2);
    assert.equal((await backfillProfileCertificates({ apply: true })).ready, 0);
  });
});
