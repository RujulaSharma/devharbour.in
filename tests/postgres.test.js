const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

test('PostgreSQL backend: concurrency, ownership, persistence and certificates', {
  skip: process.env.DB_PROVIDER !== 'postgresql', timeout: 300000,
}, async t => {
  process.env.NODE_ENV = 'test';
  const database = require('../server/database');
  const prisma = require('../server/prisma').getPrisma();
  const app = require('../server/index');
  const users = [];
  let participantId;
  let server;
  t.after(async () => {
    try {
      if (server) await new Promise(resolve => server.close(resolve));
      if (participantId) {
        await prisma.issued_certificates.deleteMany({ where: { participant_id: participantId } });
        await prisma.event_participants.deleteMany({ where: { id: participantId } });
      }
      await prisma.users.deleteMany({ where: { id: { in: users } } });
    } finally { await database.close(); }
  });
  await database.ready();
  server = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  const base = `http://127.0.0.1:${server.address().port}/api`;
  async function api(route, method = 'GET', token, body) {
    const response = await fetch(base + route, { method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await response.json();
    if (route === '/auth/signup' && response.status === 201) users.push(data.user.id);
    return { status: response.status, data };
  }
  const suffix = crypto.randomUUID().replaceAll('-', '').slice(0, 16);
  const account = { email: `pg-${suffix}@example.test`, username: `pg_${suffix}`, fullName: 'Prisma Integration Test', password: crypto.randomBytes(20).toString('hex') };
  const signup = await api('/auth/signup', 'POST', null, account);
  assert.equal(signup.status, 201);
  const token = signup.data.token;
  const userId = signup.data.user.id;

  await t.test('Supabase health and invalid-session handling', async () => {
    assert.equal((await api('/health')).data.database, 'postgresql');
    assert.equal((await api('/auth/me', 'GET', 'invalid-token')).status, 401);
    await prisma.sessions.updateMany({ where: { user_id: userId }, data: { expires_at: new Date(Date.now() - 1000).toISOString() } });
    assert.equal((await api('/auth/me', 'GET', token)).status, 401);
    await prisma.sessions.updateMany({ where: { user_id: userId }, data: { expires_at: new Date(Date.now() + 3600000).toISOString() } });
    assert.equal((await api('/auth/me', 'GET', token)).status, 200);
  });
  await t.test('Concurrent lesson completions award exactly one XP event', async () => {
    const responses = await Promise.all([1, 2, 3].map(() => api('/courses/lesson/lesson-cs50-1/complete', 'POST', token)));
    for (const response of responses) assert.equal(response.status, 200);
    assert.equal(responses.filter(r => r.data.xp.awarded).length, 1);
    assert.equal(await prisma.xp_ledger.count({ where: { user_id: userId, source_type: 'lesson_complete', reference_id: 'lesson-cs50-1' } }), 1);
    const progress = await prisma.lesson_progress.findFirst({ where: { user_id: userId } });
    assert.equal(progress.reading_seconds, 90);
  });
  await t.test('Workspace CRUD enforces ownership and persists all item types', async () => {
    const other = await api('/auth/signup', 'POST', null, { ...account, email: `pg2-${suffix}@example.test`, username: `pg2_${suffix}` });
    assert.equal(other.status, 201);
    const entries = [
      ['tasks', { title: 'Database task', priority: 'high' }, 'task'],
      ['notes', { title: 'Database note', content: 'Saved in PostgreSQL', isPinned: true }, 'note'],
      ['assignments', { title: 'Database assignment', status: 'pending' }, 'assignment'],
      ['snippets', { name: 'Database snippet', code: 'console.log(1)', language: 'javascript' }, 'snippet'],
      ['bookmarks', { title: 'Database bookmark', url: 'https://example.test/prisma' }, 'bookmark'],
    ];
    for (const [kind, data, key] of entries) {
      const created = await api(`/workspace/${kind}`, 'POST', token, data);
      assert.equal(created.status, 201);
      const itemId = created.data[key].id;
      assert.equal((await api(`/workspace/${kind}/${itemId}`, 'DELETE', other.data.token)).status, 404);
      if (['tasks', 'notes', 'assignments'].includes(kind)) {
        assert.equal((await api(`/workspace/${kind}/${itemId}`, 'PUT', other.data.token, { title: 'Forbidden' })).status, 404);
        assert.equal((await api(`/workspace/${kind}/${itemId}`, 'PUT', token, { title: 'Updated' })).status, 200);
      }
      assert.ok((await api('/workspace', 'GET', token)).data[kind].some(item => item.id === itemId));
      assert.equal((await api(`/workspace/${kind}/${itemId}`, 'DELETE', token)).status, 200);
    }
  });
  await t.test('Profiles, achievements, privacy, filters and leaderboard timeframes', async () => {
    assert.equal((await api('/auth/profile', 'PUT', token, { bio: 'Saved to Supabase', location: 'Local development' })).status, 200);
    assert.equal((await api('/user/summary', 'GET', token)).status, 200);
    assert.equal((await api('/achievements', 'GET', token)).status, 200);
    assert.equal((await api('/achievements/user', 'GET', token)).status, 200);
    assert.equal((await api(`/user/profile/${account.username}`)).status, 200);
    await api('/user/settings', 'POST', token, { profilePublic: false });
    assert.equal((await api(`/user/profile/${account.username}`)).status, 403);
    for (const timeframe of ['Weekly', 'Monthly', 'All-time']) assert.equal((await api(`/leaderboard?timeframe=${timeframe}`, 'GET', token)).status, 200);
    assert.equal((await api('/challenges?search=sum')).status, 200);
    assert.equal((await api('/projects?search=dev')).status, 200);
  });
  await t.test('New certificate issuance is idempotent and verifiable', async () => {
    const participant = await database.insertParticipant({ candidateName: 'Prisma Test Participant', candidateEmail: `cert-${suffix}@example.test` });
    participantId = participant.id;
    const claim = await api('/certificates/claim', 'POST', null, { email: participant.candidate_email });
    assert.equal(claim.status, 201);
    assert.equal((await api(`/certificates/verify/${claim.data.credential.credential_id}`)).data.verified, true);
    const repeated = await api('/certificates/claim', 'POST', null, { email: participant.candidate_email });
    assert.equal(repeated.data.alreadyIssued, true);
    assert.equal(await prisma.issued_certificates.count({ where: { participant_id: participantId } }), 1);
  });
  await t.test('Logout removes the server-side session', async () => {
    assert.equal((await api('/auth/logout', 'POST', token)).status, 200);
    assert.equal((await api('/auth/me', 'GET', token)).status, 401);
  });
});
