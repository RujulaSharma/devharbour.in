const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('Cloudflare ID parameter routes serve the ID page rather than the SPA homepage', async t => {
  const source = fs.readFileSync('functions/id/[[developerId]].js', 'utf8');
  const { onRequest } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  const originalFetch = global.fetch;
  t.after(() => { global.fetch = originalFetch; });
  const page = fs.readFileSync('public/id/index.html', 'utf8');
  let call;
  global.fetch = async (url, options) => {
    call = { url: String(url), options };
    return new Response(options.method === 'HEAD' ? null : page, { headers: { 'Content-Type': 'text/html' } });
  };
  const env = { RENDER_ORIGIN: 'https://backend.example.test/' };
  await t.test('GET preserves the ID parameter and returns the actual standalone page', async () => {
    const result = await onRequest({ request: new Request('https://www.devharbour.in/id/DH-1234ABCD?asVisitor=1'), env });
    assert.equal(result.status, 200);
    assert.equal(await result.text(), page);
    assert.equal(call.url, 'https://backend.example.test/id/DH-1234ABCD');
    assert.equal(call.options.redirect, 'manual');
    assert.equal(result.headers.get('cache-control'), 'private, no-store');
  });
  await t.test('HEAD returns no page body', async () => {
    const result = await onRequest({ request: new Request('https://www.devharbour.in/id/DH-1234ABCD', { method: 'HEAD' }), env });
    assert.equal(call.options.method, 'HEAD');
    assert.equal(await result.text(), '');
  });
  await t.test('invalid paths and unsupported methods cannot reach the upstream', async () => {
    for (const path of ['/id/INVALID', '/id/DH-1234ABCD/extra']) {
      assert.equal((await onRequest({ request: new Request('https://www.devharbour.in' + path), env })).status, 404);
    }
    assert.equal((await onRequest({ request: new Request('https://www.devharbour.in/id/DH-1234ABCD', { method: 'POST' }), env })).status, 405);
  });
  await t.test('invalid backend configuration fails closed', async () => {
    for (const RENDER_ORIGIN of ['', 'http://example.test', 'https://user:password@example.test']) {
      assert.equal((await onRequest({ request: new Request('https://www.devharbour.in/id/DH-1234ABCD'), env: { RENDER_ORIGIN } })).status, 503);
    }
  });
});
