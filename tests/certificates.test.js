const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
process.env.NODE_ENV = 'test';
process.env.DB_PROVIDER ||= 'sqlite';
let temporaryDirectory;
if (process.env.DB_PROVIDER === 'sqlite' && !process.env.DB_PATH) {
  const fs = require('node:fs');
  const path = require('node:path');
  temporaryDirectory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'devharbour-certs-'));
  process.env.DB_PATH = path.join(temporaryDirectory, 'test.sqlite');
  fs.copyFileSync(path.join(__dirname, '..', 'devharbour.sqlite'), process.env.DB_PATH);
}
const app = require('../server/index');
const database = require('../server/database');

test('Certificates API Suite', async (t) => {
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    await database.close();
    if (temporaryDirectory) require('node:fs').rmSync(temporaryDirectory, { recursive: true });
  });

  await t.test('GET /api/certificates/stats returns registry status and participant count', async () => {
    const res = await fetch(`${baseUrl}/api/certificates/stats`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.event, 'ORCA CODERS: ORCATHON 2026');
    assert.equal(typeof body.totalParticipants, 'number');
    assert.ok(body.totalParticipants >= 690);
  });

  await t.test('POST /api/certificates/claim rejects unregistered participant email', async () => {
    const res = await fetch(`${baseUrl}/api/certificates/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'unknown.participant.999@test.com', name: 'Unknown' })
    });
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.ok(body.error.includes('No registration found'));
  });

  await t.test('POST /api/certificates/claim successfully issues certificate for registered participant', async () => {
    const res = await fetch(`${baseUrl}/api/certificates/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'poornika0406@gmail.com', name: 'Poornika R' })
    });
    assert.ok(res.status === 200 || res.status === 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.credential.recipient_name, 'Poornika R');
    assert.ok(body.credential.credential_id.startsWith('DH-ORCA-2026-'));
  });

  await t.test('GET /api/certificates/verify/:id returns authentic credential record', async () => {
    // Check Poornika's credential
    const claimRes = await fetch(`${baseUrl}/api/certificates/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'poornika0406@gmail.com' })
    });
    const claimBody = await claimRes.json();
    const credId = claimBody.credential.credential_id;

    const verifyRes = await fetch(`${baseUrl}/api/certificates/verify/${credId}`);
    assert.equal(verifyRes.status, 200);
    const verifyBody = await verifyRes.json();
    assert.equal(verifyBody.verified, true);
    assert.equal(verifyBody.credential.credential_id, credId);
    assert.equal(verifyBody.credential.recipient_name, 'Poornika R');
    assert.equal(verifyBody.credential.status, 'Valid');
  });

  await t.test('GET /api/certificates/verify/:id returns 404 for invalid credential ID', async () => {
    const verifyRes = await fetch(`${baseUrl}/api/certificates/verify/DH-FAKE-9999`);
    assert.equal(verifyRes.status, 404);
    const verifyBody = await verifyRes.json();
    assert.equal(verifyBody.verified, false);
  });
});
