process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:';
process.env.LOGIN_EMAIL_OTP = 'true';
process.env.EMAIL_VERIFICATION_SECRET = 'test-only-login-code-secret';

const test = require('node:test');
const assert = require('node:assert/strict');
const loginCodes = require('../server/login-code');

test('password login creates a session only after code confirmation', async t => {
  const id = 'a1e8b300-1234-4321-8490-0123456789ab';
  let accountId;
  let consumed = false;
  t.mock.method(loginCodes, 'sendLoginCode', async user => {
    accountId = user.id;
    return id;
  });
  t.mock.method(loginCodes, 'consumeLoginCode', async (challenge, code, getUser) => {
    if (challenge !== id || code !== '123456' || consumed) return null;
    consumed = true;
    return getUser(accountId);
  });
  const app = require('../server/index');
  const db = require('../server/db');
  const { hashPassword } = require('../server/auth');
  const { salt, hash } = hashPassword('Test-password-42');
  const user = await db.createUser({ email: 'otptest@example.test', username: 'otptest', fullName: 'OTP Test', salt, passwordHash: hash });
  await db.markEmailVerified(user.id);
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => server.close());
  const post = (path, body) => fetch('http://127.0.0.1:' + server.address().port + '/api/auth/login' + path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  const login = await post('', { login: user.email, password: 'Test-password-42' });
  assert.equal(login.status, 202);
  assert.deepEqual(await login.json(), { requiresLoginCode: true, challengeId: id });
  assert.equal((await post('/verify', { challengeId: id, code: '654321' })).status, 401);
  const validated = await post('/verify', { challengeId: id, code: '123456' });
  assert.equal(validated.status, 200);
  assert.ok((await validated.json()).token);
  assert.equal((await post('/verify', { challengeId: id, code: '123456' })).status, 401);
});
