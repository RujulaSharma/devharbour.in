process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:';
process.env.LOGIN_EMAIL_OTP = 'false';
process.env.APP_BASE_URL = 'http://localhost:3000';
process.env.REDIS_URL = '';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../server/index');
const db = require('../server/db');
const { hashPassword } = require('../server/auth');

test('proxied password sign-in, cookie refresh, owner profile and sign-out work on both public hosts', async t => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  let publicHost;
  const proxy = http.createServer((request, response) => {
    const upstream = http.request({ host: '127.0.0.1', port: server.address().port,
      method: request.method, path: request.url, headers: { ...request.headers, host: 'devharbour-in.onrender.com', 'x-forwarded-host': publicHost } }, incoming => {
      response.writeHead(incoming.statusCode, incoming.headers);
      incoming.pipe(response);
    });
    upstream.on('error', () => { response.writeHead(502); response.end(); });
    request.pipe(upstream);
  }).listen(0, '127.0.0.1');
  await new Promise(resolve => proxy.once('listening', resolve));
  t.after(async () => { await new Promise(resolve => proxy.close(resolve)); await new Promise(resolve => server.close(resolve)); });
  const { salt, hash } = hashPassword('Fixture-password-2026!');
  const account = await db.createUser({ email: 'proxy-fixture@example.test', username: 'proxy_fixture',
    fullName: 'Proxy Fixture', passwordHash: hash, salt });
  await db.markEmailVerified(account.id);
  const base = 'http://127.0.0.1:' + proxy.address().port;
  for (const host of ['devharbour.in', 'www.devharbour.in']) {
    publicHost = host;
    const headers = { Origin: 'https://' + host, 'Sec-Fetch-Site': 'same-origin', 'Content-Type': 'application/json' };
    const signedIn = await fetch(base + '/api/auth/login', { method: 'POST', headers,
      body: JSON.stringify({ login: account.email, password: 'Fixture-password-2026!' }) });
    assert.equal(signedIn.status, 200);
    const signedInBody = await signedIn.json();
    const setCookie = signedIn.headers.get('set-cookie');
    assert.match(setCookie, /Domain=devharbour.in/);
    assert.match(setCookie, /HttpOnly/);
    assert.match(setCookie, /SameSite=Strict/);
    const cookie = setCookie.split(';')[0];
    for (const path of ['/api/auth/me', '/api/profile/me']) {
      const response = await fetch(base + path, { headers: { 'Sec-Fetch-Site': 'same-origin', Cookie: cookie } });
      assert.equal(response.status, 200);
      if (path === '/api/auth/me') assert.match(response.headers.get('set-cookie'), /Domain=devharbour.in/);
      assert.equal((await response.json()).user.id, account.id);
    }
    assert.equal((await fetch(base + '/api/auth/me', { headers: { Cookie: cookie,
      Origin: 'https://unrelated.example', 'Sec-Fetch-Site': 'cross-site' } })).status, 401);
    const logout = await fetch(base + '/api/auth/logout', { method: 'POST', headers: { ...headers, Cookie: cookie } });
    assert.equal(logout.status, 200);
    const cleared = logout.headers.getSetCookie();
    assert(cleared.some(value => /Domain=devharbour.in/.test(value)));
    assert(cleared.some(value => !/Domain=/.test(value)));
    assert.equal((await fetch(base + '/api/auth/me', { headers: { ...headers, Cookie: cookie } })).status, 401);
    assert.equal((await fetch(base + '/api/auth/me', { headers: { Authorization: 'Bearer ' + signedInBody.token } })).status, 401);
  }
});
