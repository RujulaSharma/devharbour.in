const test = require('node:test');
const assert = require('node:assert/strict');
const { applicationBaseUrl } = require('../server/site-origin');
const req = (host, origin) => ({ protocol: 'https', headers: { origin }, get: () => host });
test('public configuration rejects a localhost deployment URL behind Render', () => {
  const previous = process.env.APP_BASE_URL;
  process.env.APP_BASE_URL = 'http://localhost:3000';
  try {
    assert.equal(applicationBaseUrl(req('devharbour-in.onrender.com')), 'https://www.devharbour.in');
    for (const host of ['devharbour.in', 'www.devharbour.in']) {
      assert.equal(applicationBaseUrl(req('devharbour-in.onrender.com', 'https://' + host)), 'https://' + host);
      assert.equal(applicationBaseUrl(req(host)), 'https://' + host);
    }
    const untrusted = req('devharbour-in.onrender.com', 'https://unrelated.example');
    untrusted.headers['x-forwarded-host'] = 'unrelated.example';
    assert.equal(applicationBaseUrl(untrusted), 'https://www.devharbour.in');
  } finally {
    if (previous === undefined) delete process.env.APP_BASE_URL;
    else process.env.APP_BASE_URL = previous;
  }
});
test('local development retains an explicitly configured loopback URL', () => {
  const previous = { base: process.env.APP_BASE_URL, mode: process.env.NODE_ENV };
  process.env.APP_BASE_URL = 'http://localhost:3399';
  process.env.NODE_ENV = 'development';
  try { assert.equal(applicationBaseUrl(req('127.0.0.1:4500')), 'http://localhost:3399'); }
  finally {
    for (const [key, value] of [['APP_BASE_URL', previous.base], ['NODE_ENV', previous.mode]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});
