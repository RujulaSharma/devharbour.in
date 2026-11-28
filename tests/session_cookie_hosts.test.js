const test = require('node:test');
const assert = require('node:assert/strict');
process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:';
const { setSessionCookie, clearSessionCookie, getAuthToken } = require('../server/auth');

function request(host, origin = 'https://' + host, site = 'same-origin') {
  return { headers: { origin, 'sec-fetch-site': site, cookie: 'dh_session=' + 'a'.repeat(64) },
    get: name => name === 'host' ? host : undefined, protocol: 'https', secure: true };
}
function response() {
  const cookies = [], cleared = [];
  return { cookies, cleared, setHeader() {},
    cookie(name, value, options) { cookies.push({ name, value, options }); },
    clearCookie(name, options) { cleared.push({ name, options }); } };
}
test('production hostname aliases share and clear persistent session cookies', () => {
  for (const host of ['devharbour.in', 'www.devharbour.in']) {
    const req = request(host), res = response();
    setSessionCookie(req, res, 'a'.repeat(64), new Date(Date.now() + 86400000));
    assert.equal(res.cookies.length, 1);
    assert.equal(res.cookies[0].options.domain, 'devharbour.in');
    assert.equal(res.cookies[0].options.httpOnly, true);
    assert.equal(res.cookies[0].options.secure, true);
    assert.equal(res.cookies[0].options.sameSite, 'strict');
    clearSessionCookie(req, res);
    assert(res.cleared.some(cookie => cookie.options.domain === 'devharbour.in'));
  }
});
test('public-site sessions survive the Cloudflare to Render host rewrite', () => {
  const previous = process.env.APP_BASE_URL;
  process.env.APP_BASE_URL = 'http://localhost:3000';
  try {
    for (const host of ['devharbour.in', 'www.devharbour.in']) {
      const req = request('devharbour-in.onrender.com', 'https://' + host), res = response();
      setSessionCookie(req, res, 'a'.repeat(64), new Date(Date.now() + 86400000));
      assert.equal(res.cookies.length, 1, 'The public Origin must remain valid behind the reverse proxy');
      assert.equal(res.cookies[0].options.domain, 'devharbour.in');
      assert.equal(getAuthToken(req), 'a'.repeat(64));
      clearSessionCookie(req, res);
      assert(res.cleared.some(cookie => cookie.options.domain === 'devharbour.in'));
      assert(res.cleared.some(cookie => !cookie.options.domain), 'Clear any legacy host-only cookie too');
    }
  } finally {
    if (previous === undefined) delete process.env.APP_BASE_URL;
    else process.env.APP_BASE_URL = previous;
  }
});
test('untrusted origins and cross-site requests still cannot use session cookies', () => {
  for (const req of [request('devharbour-in.onrender.com', 'https://unrelated.example'),
    request('devharbour-in.onrender.com', 'https://devharbour.in', 'cross-site'),
    request('devharbour-in.onrender.com', 'https://devharbour.in.attacker.example')]) {
    req.headers['x-forwarded-host'] = 'www.devharbour.in';
    const res = response();
    setSessionCookie(req, res, 'a'.repeat(64), new Date());
    clearSessionCookie(req, res);
    assert.equal(res.cookies.length, 0);
    assert.equal(res.cleared.length, 0);
    assert.equal(getAuthToken(req), null);
  }
});
test('same-origin GET refreshes retain public cookie scope without an Origin header', () => {
  for (const host of ['devharbour.in', 'www.devharbour.in']) {
    const req = request('devharbour-in.onrender.com');
    delete req.headers.origin;
    req.headers['x-forwarded-host'] = host;
    const res = response();
    setSessionCookie(req, res, 'a'.repeat(64), new Date());
    assert.equal(res.cookies[0].options.domain, 'devharbour.in');
  }
  const req = request('devharbour-in.onrender.com');
  delete req.headers.origin;
  req.headers['x-forwarded-host'] = 'devharbour.in.attacker.example';
  const res = response();
  setSessionCookie(req, res, 'a'.repeat(64), new Date());
  assert.equal(res.cookies[0].options.domain, undefined);
});
test('public HTTPS cookies remain Secure even when the upstream runs with development proxy defaults', () => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = 'development';
  try {
    for (const origin of ['https://devharbour.in', undefined]) {
      const req = request('devharbour-in.onrender.com');
      req.secure = false; req.protocol = 'http';
      if (origin) req.headers.origin = origin; else delete req.headers.origin;
      req.headers['x-forwarded-host'] = 'devharbour.in';
      const res = response();
      setSessionCookie(req, res, 'a'.repeat(64), new Date());
      clearSessionCookie(req, res);
      assert.equal(res.cookies[0].options.secure, true);
      assert(res.cleared.every(cookie => cookie.options.secure));
    }
  } finally { if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous; }
});
