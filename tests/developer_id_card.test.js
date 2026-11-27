process.env.NODE_ENV = 'test';
process.env.DB_PROVIDER = 'sqlite';
process.env.DB_PATH = ':memory:';
process.env.PROFILE_ECOSYSTEM_ENABLED = 'true';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const db = require('../server/db');
const store = require('../server/profile/store');
const { profilePrisma } = require('../server/profile/prisma');
const cards = require('../server/profile/id-card');
const app = require('../server/index');

test('Developer ID parameter page and downloads use saved data and profile privacy', async t => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = 'http://127.0.0.1:' + server.address().port;
  async function make(username, fullName) {
    const user = await db.createUser({ username, fullName, email: username + '@example.test', passwordHash: 'fixture', salt: 'fixture' });
    await db.markEmailVerified(user.id);
    const token = (await db.createSession(user.id)).token;
    return { user, token, code: cards.code(user) };
  }
  const alice = await make('card_alice', 'Alice <Builder> & Co');
  const bob = await make('card_bob', 'Bob Developer');
  const endpoint = '/api/profile/id/' + alice.code;
  const request = (path = endpoint, who = null) => fetch(base + path, { headers: who ? { Authorization: 'Bearer ' + who.token } : {} });
  async function preferences(data) {
    const p = await store.getProfile(alice.user.id);
    await store.save(alice.user.id, { ...data, version: p.version });
  }

  await t.test('parameter page loads and both profile controls open it', async () => {
    const page = await request('/id/' + alice.code);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /id="card-preview"/);
    const source = fs.readFileSync('public/assets/profile-ecosystem.js', 'utf8');
    assert.match(source, /const idPage = `\/id\/\$\{encodeURIComponent\(developerId.code\)\}/);
    assert.match(source, /class="dp-dev-id-box dp-dev-id-link" href="\$\{esc\(idPage\)\}"/);
    assert.match(source, />View ID card<\/a>/);
  });
  await t.test('owner gets their real card and stable display ID without private account fields', async () => {
    const response = await request(endpoint, alice);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    const { card } = await response.json();
    assert.equal(card.developerId, alice.code);
    assert.equal(card.fullName, alice.user.full_name);
    assert.equal(card.username, alice.user.username);
    assert.equal(card.isOwner, true);
    assert.equal(card.pageUrl, '/id/' + alice.code);
    assert.equal(card.level, 1);
    assert.equal(card.totalXp, 0);
    for (const forbidden of ['email', 'password_hash', 'salt', 'certificate_name']) assert.ok(!(forbidden in card));
    assert.equal((await request(endpoint.toLowerCase(), alice)).status, 200);
  });
  await t.test('private profiles deny anonymous and other-user JSON and SVG access', async () => {
    for (const suffix of ['', '/card.svg', '/download']) {
      assert.equal((await request(endpoint + suffix)).status, 404);
      assert.equal((await request(endpoint + suffix, bob)).status, 404);
    }
    assert.equal((await request(endpoint + '?asVisitor=1', alice)).status, 404);
  });
  await t.test('download matches preview, uses escaped name, and legacy owner export still works', async () => {
    const preview = await request(endpoint + '/card.svg', alice);
    const download = await request(endpoint + '/download', alice);
    assert.equal(download.status, 200);
    assert.match(download.headers.get('content-disposition'), /attachment/);
    assert.match(download.headers.get('content-disposition'), new RegExp(alice.code));
    const svg = await preview.text();
    assert.equal(await download.text(), svg);
    assert.match(svg, /Alice &lt;Builder&gt; &amp; Co/);
    assert.ok(!svg.includes('<Builder>'));
    assert.match(svg, new RegExp(alice.code));
    assert.equal((await request('/api/profile/me/id-card', alice)).status, 200);
    assert.equal((await request('/api/profile/me/id-card')).status, 401);
  });
  await t.test('public ID access respects statistics, location and QR settings', async () => {
    await preferences({ visibility: 'public', city: 'Private City', headline: 'Saved headline', privacy: { developerId: 'public', statistics: 'private', location: 'private' }, details: { showDeveloperId: true, showQrCode: false } });
    const { card } = await (await request()).json();
    assert.equal(card.isOwner, false);
    assert.equal(card.headline, 'Saved headline');
    assert.equal(card.level, null);
    assert.equal(card.totalXp, null);
    assert.equal(card.location, '');
    const svg = await (await request(endpoint + '/download')).text();
    assert.ok(!svg.includes('XP'));
    assert.ok(!svg.includes('Private City'));
    assert.ok(!svg.includes('<svg x='));
    await preferences({ details: { showDeveloperId: false } });
    assert.equal((await request()).status, 404);
    assert.equal((await request(endpoint + '/download')).status, 404);
    assert.equal((await request(endpoint, alice)).status, 200);
  });
  await t.test('followers and blocks retain existing access rules', async () => {
    await preferences({ visibility: 'public', details: { showDeveloperId: true }, privacy: { developerId: 'followers' } });
    assert.equal((await request(endpoint, bob)).status, 404);
    await profilePrisma().profileConnection.create({ data: { fromId: bob.user.id, toId: alice.user.id, kind: 'follow', status: 'accepted' } });
    assert.equal((await request(endpoint, bob)).status, 200);
    await profilePrisma().profileConnection.create({ data: { fromId: alice.user.id, toId: bob.user.id, kind: 'block', status: 'accepted' } });
    assert.equal((await request(endpoint, bob)).status, 404);
    assert.equal((await request(endpoint + '/download', bob)).status, 404);
  });
  await t.test('invalid or missing IDs cannot resolve another account', async () => {
    assert.equal((await request('/api/profile/id/DH-NOT-A-USER')).status, 404);
    assert.equal((await request('/api/profile/id/INVALID')).status, 404);
    assert.equal(await cards.findUser("DH-' OR 1=1 --"), null);
  });
});
