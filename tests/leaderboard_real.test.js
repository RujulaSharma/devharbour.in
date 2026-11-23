const test = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:';
const db = require('../server/db');
const app = require('../server/index');

test('leaderboard ranks recorded XP and excludes demo, unverified, and private entries', async t => {
  async function add(username, email, { xp, verified = true, isPrivate = false }) {
    const user = await db.createUser({ username, email, fullName: username, passwordHash: 'fixture', salt: 'fixture' });
    if (verified) await db.markEmailVerified(user.id);
    if (isPrivate) await db.saveUserSettings(user.id, { profilePublic: 0 });
    if (xp) db.db.prepare("INSERT INTO xp_ledger(id,user_id,amount,source_type,reference_id) VALUES (?,?,?,'challenge_pass','two-sum')").run(username, user.id, xp);
    return user;
  }
  const real = await add('board_real', 'real@leaderboard-fixture.invalid', { xp: 25 });
  await add('board_unverified', 'unverified@leaderboard-fixture.invalid', { xp: 80, verified: false });
  await add('board_private', 'private@leaderboard-fixture.invalid', { xp: 90, isPrivate: true });
  await add('board_zero', 'zero@leaderboard-fixture.invalid', { xp: 0 });
  await add('board_fixture', 'fixture@example.test', { xp: 100 });
  await db.markEmailVerified('usr-mei');
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => server.close());

  const url = 'http://127.0.0.1:' + server.address().port + '/api/leaderboard?timeframe=Weekly';
  const response = await fetch(url);
  assert.equal(response.status, 200);
  const { rankings } = await response.json();
  assert.deepEqual(rankings.map(row => [row.userId, row.xp, row.rank]), [[real.id, 25, 1]]);

  t.mock.method(db, 'getLeaderboard', async () => { throw Error('fixture outage'); });
  const offline = await fetch(url);
  assert.equal(offline.status, 503);
  assert.deepEqual((await offline.json()).rankings, []);
});

test('activity streak uses consecutive India dates and allows yesterday as the latest active day', () => {
  const { currentActivityStreaks } = require('../server/activity-streak');
  const rows = [
    { user_id: 'active', activity_day: '2026-11-24' },
    { user_id: 'active', activity_day: '2026-11-23' },
    { user_id: 'active', activity_day: '2026-11-23' },
    { user_id: 'active', activity_day: '2026-11-21' },
    { user_id: 'yesterday', activity_day: '2026-11-23' },
    { user_id: 'yesterday', activity_day: '2026-11-22' },
    { user_id: 'expired', activity_day: '2026-11-22' }
  ];
  const streaks = currentActivityStreaks(rows, Date.parse('2026-11-23T19:00:00Z'));
  assert.equal(streaks.get('active'), 2);
  assert.equal(streaks.get('yesterday'), 2);
  assert.equal(streaks.get('expired'), 0);
});
