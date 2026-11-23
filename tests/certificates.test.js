process.env.NODE_ENV = 'test';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../server/index');
const { getPgPool } = require('../server/supabase');

test('Certificates API Suite', async (t) => {
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  t.after(async () => {
    server.close();
    const pool = getPgPool();
    if (pool) {
      await pool.end();
    }
  });

  await t.test('claim uses the verified owner and public verification respects revocation', async () => {
    const db = require('../server/db');
    const email = 'owner.' + Date.now() + '@example.test';
    const user = await db.createUser({ email, username: 'claim_' + Date.now(), fullName: 'Fixture Owner', salt: 'test', passwordHash: 'test' });
    await db.insertParticipant({ candidateName: 'Fixture Owner', candidateEmail: email });
    await db.markEmailVerified(user.id);
    const { token } = await db.createSession(user.id);
    const claim = headers => fetch(baseUrl + '/api/certificates/claim', { method: 'POST', headers });
    assert.equal((await claim({})).status, 401);
    const result = await claim({ Authorization: 'Bearer ' + token });
    assert.equal(result.status, 201);
    const { credential } = await result.json();
    assert.equal(credential.recipient_email, email);
    const verify = () => fetch(baseUrl + '/api/certificates/verify/' + credential.credential_id).then(r => r.json());
    assert.equal((await verify()).verified, true);
    db.db.prepare("UPDATE issued_certificates SET status = 'Revoked' WHERE credential_id = ?").run(credential.credential_id);
    assert.equal((await verify()).verified, false);
  });

  await t.test('GET /api/certificates/verify/:id returns 404 for invalid credential ID', async () => {
    const verifyRes = await fetch(`${baseUrl}/api/certificates/verify/DH-FAKE-9999`);
    assert.equal(verifyRes.status, 404);
    const verifyBody = await verifyRes.json();
    assert.equal(verifyBody.verified, false);
  });
});
