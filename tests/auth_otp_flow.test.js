const test = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:';
process.env.REDIS_URL = '';
process.env.LOGIN_EMAIL_OTP = 'false';
process.env.RESEND_API_KEY = 're_test_otp_flow';
process.env.EMAIL_FROM = 'verify@example.test';
process.env.EMAIL_VERIFICATION_SECRET = 'otp-flow-test-secret-at-least-32-characters';

const originalFetch = global.fetch;
const deliveries = [];
let rejectDelivery = false;
global.fetch = async (url, options) => {
  if (String(url) === 'https://api.resend.com/emails') {
    if (rejectDelivery) return new Response('{}', { status: 503 });
    deliveries.push(JSON.parse(options.body));
    return Response.json({ id: 'test-delivery' });
  }
  return originalFetch(url, options);
};

const app = require('../server/index');
const db = require('../server/db');
let server;
let base;
test.before(async () => {
  await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); });
  base = `http://127.0.0.1:${server.address().port}/api/auth`;
});
test.after(async () => {
  global.fetch = originalFetch;
  await new Promise(resolve => server.close(resolve));
  await db.pool?.end();
});

async function request(path, body, token, method = 'POST') {
  const response = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  return { status: response.status, headers: response.headers, body: await response.json() };
}

test('signup requires the emailed code, consumes it once, and logout revokes the session', async () => {
  const account = { email: 'otp-flow@example.test', username: 'otp_flow', fullName: 'OTP Flow', password: 'UniqueTestPassword!42' };
  const signup = await request('/signup', account);
  assert.equal(signup.status, 201);
  assert.equal(signup.body.requiresVerification, true);
  assert.equal(signup.body.token, undefined);
  assert.equal(signup.body.emailSent, true);
  const delivery = deliveries.at(-1);
  assert.deepEqual(delivery.to, [account.email]);
  const firstCode = delivery.text.match(/\b\d{6}\b/)[0];
  const duplicate = await request('/signup', account);
  assert.equal(duplicate.status, 409);
  assert.equal(duplicate.body.requiresVerification, true);
  assert.equal(duplicate.body.token, undefined);
  assert.equal((await request('/otp/send', { email: account.email })).status, 429);
  db.db.prepare("UPDATE email_verifications SET sent_at = datetime('now', '-2 minutes') WHERE email = ?").run(account.email);
  assert.equal((await request('/otp/send', { email: account.email })).status, 200);
  const code = deliveries.at(-1).text.match(/\b\d{6}\b/)[0];
  if (firstCode !== code) assert.equal((await request('/otp/verify', { email: account.email, otp: firstCode })).status, 400);
  const login = { login: account.email, password: account.password };
  assert.equal((await request('/login', login)).status, 403);
  const wrongCode = code === '100000' ? '100001' : '100000';
  assert.equal((await request('/otp/verify', { email: account.email, otp: wrongCode })).status, 400);
  const verified = await request('/otp/verify', { email: account.email, otp: code });
  assert.equal(verified.status, 200);
  assert.ok(verified.body.token);
  assert.equal(verified.body.user.emailVerified, true);
  assert.equal((await request('/otp/verify', { email: account.email, otp: code })).status, 400);
  const signedIn = await request('/login', login);
  assert.equal(signedIn.status, 200);
  assert.ok(signedIn.body.token);
  const cookie = signedIn.headers.get('set-cookie');
  assert.match(cookie, /dh_session=[0-9a-f]{64}; Path=\/api; Expires=.*; HttpOnly; SameSite=Strict/);
  const cookieHeader = cookie.split(';')[0];
  const reopened = await fetch(base + '/me', { headers: { Cookie: cookieHeader } });
  assert.equal(reopened.status, 200);
  assert.equal((await reopened.json()).user.email, account.email);
  const crossOrigin = await fetch(base + '/me', { headers: { Cookie: cookieHeader, Origin: 'https://unrelated.example.test', 'Sec-Fetch-Site': 'cross-site' } });
  assert.equal(crossOrigin.status, 401);
  const logout = await fetch(base + '/logout', { method: 'POST', headers: { Cookie: cookieHeader } });
  assert.equal(logout.status, 200);
  assert.match(logout.headers.get('set-cookie'), /dh_session=;/);
  assert.equal((await request('/me', null, signedIn.body.token, 'GET')).status, 401);
});

test('failed delivery leaves a pending account without a session', async () => {
  rejectDelivery = true;
  try {
    const result = await request('/signup', { email: 'failed-delivery@example.test', username: 'failed_delivery', fullName: 'Delivery Test', password: 'UniqueTestPassword!42' });
    assert.equal(result.status, 201);
    assert.equal(result.body.requiresVerification, true);
    assert.equal(result.body.emailSent, false);
    assert.equal(result.body.token, undefined);
  } finally {
    rejectDelivery = false;
  }
});
