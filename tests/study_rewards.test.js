const test = require('node:test');
const assert = require('node:assert/strict');
process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:';
process.env.EMAIL_VERIFICATION_SECRET = 'test-only-study-reward-key';

const app = require('../server/index');
const db = require('../server/db');
const { startFocus } = require('../server/study-rewards');

test('requests earn study XP only after a valid session and at most once per activity each day', async t => {
  const user = await db.createUser({ email: 'study-rewards@example.test', username: 'study_rewards', fullName: 'Study Test', passwordHash: 'fixture', salt: 'fixture' });
  await db.markEmailVerified(user.id);
  const { token } = await db.createSession(user.id);
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => server.close());
  const base = 'http://127.0.0.1:' + server.address().port + '/api/workspace';
  const request = (path, body, method = 'POST') => fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify(body)
  });
  assert.equal((await request('/focus/start', { minutes: 1 })).status, 400);
  const started = await (await request('/focus/start', { minutes: 25 })).json();
  assert.equal((await request('/focus/complete', { token: started.token })).status, 400);
  const secret = process.env.EMAIL_VERIFICATION_SECRET;
  const elapsed = Date.now() - 26 * 60 * 1000;
  assert.equal((await request('/focus/complete', { token: startFocus('different-user', 25, secret, elapsed) })).status, 400);
  const eligible = startFocus(user.id, 25, secret, elapsed);
  const complete = () => request('/focus/complete', { token: eligible }).then(res => res.json()).then(data => data.reward);
  const first = await complete();
  assert.equal(first.amount, 15);
  assert.equal((await complete()).awarded, false);
  const pending = await (await request('/assignments', { title: 'Finish example exercises' })).json();
  assert.equal(pending.reward, null);
  const done = await (await request('/assignments/' + pending.assignment.id, { status: 'completed' }, 'PUT')).json();
  assert.equal(done.reward.amount, 10);
  const duplicate = await (await request('/assignments', { title: 'Second assignment', status: 'completed' })).json();
  assert.equal(duplicate.reward.awarded, false);
  const streak = await (await fetch(base.replace('/workspace', '/leaderboard'), {
    headers: { Authorization: 'Bearer ' + token }
  })).json();
  assert.equal(streak.currentUserStreak, 1);
});
