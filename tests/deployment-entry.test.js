const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
process.env.NODE_ENV = 'test'; process.env.DB_PROVIDER = 'sqlite';
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'devharbour-deploy-'));
process.env.DB_PATH = path.join(directory, 'test.sqlite');
const app = require('../server');
const db = require('../server/database');
let server, base;
test.before(async () => {
  server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(async () => {
  server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); await db.close();
  assert.ok(path.resolve(directory).startsWith(path.resolve(os.tmpdir()) + path.sep + 'devharbour-deploy-'));
  fs.rmSync(directory, { recursive: true, force: true });
});
test('Vercel entry reuses the existing Express instance and protected APIs', async () => {
  assert.equal(app, require('../server/index'));
  for (const route of ['/api/health', '/api/courses']) assert.equal((await fetch(base + route)).status, 200);
  for (const route of ['/api/auth/me', '/api/certificates/mine']) assert.equal((await fetch(base + route)).status, 401);
});
test('SPA routes serve the canonical homepage with first-paint protection', async () => {
  for (const route of ['/', '/dashboard', '/courses', '/certificate']) {
    const response = await fetch(base + route); assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /id="dh-homepage-first-paint"/);
    assert.match(html, /id="dh-homepage-boot"/);
    const script = html.match(/src="(\/homepage\/homepage\.js\?v=[a-f0-9]+)"/)[1];
    assert.ok(html.includes(`as="script" href="${script}"`));
  }
});
test('Vercel config builds the current homepage and preserves Express API routing', () => {
  const config = require('../vercel.json');
  assert.equal(config.framework, 'express');
  assert.equal(config.buildCommand, 'npm run build:vercel');
  assert.equal(config.outputDirectory, undefined);
  const ignore = fs.readFileSync(path.join(__dirname, '../.vercelignore'), 'utf8');
  assert.ok(ignore.includes('/index.html')); assert.ok(ignore.includes('.local/'));
  for (const folder of ['assets', 'data']) for (const ext of ['js', 'json']) {
    const file = `/${folder}/orcathon_participants.${ext}`;
    assert.ok(ignore.includes('public' + file));
    assert.ok(config.rewrites.some(rule => rule.source === file && rule.destination === '/api/private-assets-unavailable'));
  }
  assert.equal(config.rewrites.some(rule => rule.source.startsWith('/api/')), false);
});
