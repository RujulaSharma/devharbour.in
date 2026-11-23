const test = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:';

const app = require('../server/index');
const db = require('../server/db');
const { hashPassword } = require('../server/auth');

test('same-named ORCATHON projects keep independent likes across reloads', async t => {
  const first = 'orcathon-' + '1'.repeat(24);
  const second = 'orcathon-' + '2'.repeat(24);
  const { salt, hash } = hashPassword('Project-Test-Password');
  const user = await db.createUser({ email: 'gallery@example.test', username: 'gallery_vote_user', fullName: 'Gallery User', salt, passwordHash: hash });
  await db.markEmailVerified(user.id);
  const { token } = await db.createSession(user.id);
  const votes = new Set();
  t.mock.method(db, 'getOrcathonProjects', async viewer => [first, second].map(id => ({
    id, name: 'Shared title', gallery_votes: Number(votes.has(id)), voted: viewer === user.id && votes.has(id)
  })));
  t.mock.method(db, 'toggleGalleryVote', async (viewer, id) => {
    assert.equal(viewer, user.id);
    const voted = !votes.delete(id);
    if (voted) votes.add(id);
    return { voted, votesCount: Number(voted) };
  });

  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => server.close());
  const base = 'http://127.0.0.1:' + server.address().port + '/api/projects';
  const headers = { Cookie: 'dh_session=' + token };
  const toggle = async () => {
    const response = await fetch(base + '/' + second + '/vote', { method: 'POST', headers });
    assert.equal(response.status, 200);
    return response.json();
  };
  assert.equal((await toggle()).voted, true);
  const response = await fetch(base + '/orcathon', { headers });
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  const { projects } = await response.json();
  assert.deepEqual(projects.map(project => [project.id, project.voted, project.gallery_votes]), [
    [first, false, 0], [second, true, 1]
  ]);
  assert.equal((await toggle()).votesCount, 0);
});
