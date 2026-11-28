const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('API proxy preserves credentials and overwrites public forwarding metadata without following redirects', async () => {
  const source = fs.readFileSync(path.join(__dirname, '../functions/api/[[path]].js'), 'utf8');
  const { onRequest } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  const original = global.fetch;
  let call;
  global.fetch = async (request, options) => { call = { request, options }; return new Response(null, { status: 307, headers: { Location: 'https://unrelated.example' } }); };
  try {
    for (const host of ['devharbour.in', 'www.devharbour.in']) {
      const result = await onRequest({ env: { RENDER_ORIGIN: 'https://backend.example.test' },
        request: new Request('https://' + host + '/api/auth/login?next=profile', { method: 'POST',
          headers: { Authorization: 'Bearer fixture-token', Cookie: 'dh_session=fixture',
            Origin: 'https://' + host, 'X-Forwarded-Host': 'unrelated.example', 'X-Forwarded-Proto': 'http' }, body: '{}' }) });
      assert.equal(result.status, 307);
      assert.equal(call.options.redirect, 'manual');
      assert.equal(call.request.url, 'https://backend.example.test/api/auth/login?next=profile');
      assert.equal(call.request.headers.get('x-forwarded-host'), host);
      assert.equal(call.request.headers.get('x-forwarded-proto'), 'https');
      assert.equal(call.request.headers.get('authorization'), 'Bearer fixture-token');
      assert.equal(call.request.headers.get('cookie'), 'dh_session=fixture');
      assert.equal(call.request.headers.get('origin'), 'https://' + host);
      assert.equal(await call.request.text(), '{}');
    }
  } finally { global.fetch = original; }
});
