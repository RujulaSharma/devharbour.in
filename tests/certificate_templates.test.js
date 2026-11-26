process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:';
const test = require('node:test');
const assert = require('node:assert/strict');
const { PDFDocument, PDFDict, PDFName } = require('pdf-lib');
const db = require('../server/db');
const pg = require('../server/db-postgres');
const originalPool = pg.pool;
// The name routes use the shared pg pool. Route these writes into this isolated
// in-memory database and reject every unexpected query, including production I/O.
pg.pool = {
  async query(sql, params) {
    assert.match(sql, /^UPDATE issued_certificates SET recipient_name=\$1 WHERE credential_id=\$2 AND lower\(recipient_email\)=\$3 AND event_slug=\$4$/);
    const result = db.db.prepare(sql.replace(/\$\d+/g, '?')).run(...params);
    return { rows: [], rowCount: result.changes };
  },
};
const app = require('../server/index');

test('both approved certificate templates regenerate only the owner display name', async t => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    pg.pool = originalPool;
    await originalPool?.end();
  });
  const user = await db.createUser({ email: 'certificate-template@example.test', username: 'certificate_template', fullName: 'Original Participant', passwordHash: 'fixture', salt: 'fixture' });
  await db.markEmailVerified(user.id);
  const token = (await db.createSession(user.id)).token;
  const base = 'http://127.0.0.1:' + server.address().port;
  const request = (path, options = {}) => fetch(base + path, { ...options, headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' } });
  for (const [event, endpoint, dimensions] of [
    ['orca-coders-orcathon-2026', '/api/orcathon-certificate', { width: 1024, height: 725 }],
    ['innovative-india-2026', '/api/innovative-certificate', { width: 1080, height: 720 }],
  ]) {
    await t.test(event, async () => {
      await db.insertParticipant({ eventSlug: event, candidateName: 'Original Participant', candidateEmail: user.email });
      const beforeResponse = await request(endpoint);
      assert.equal(beforeResponse.status, 200);
      const before = await beforeResponse.json();
      assert.equal((await request(endpoint + '/name', { method: 'PATCH', body: JSON.stringify({ name: '<invalid>' }) })).status, 400);
      const renamed = 'Élodie शर्मा';
      const update = await request(endpoint + '/name', { method: 'PATCH', body: JSON.stringify({ name: renamed, email: 'somebody-else@example.test', credentialId: 'FORGED-ID' }) });
      assert.equal(update.status, 200);
      const after = await (await request(endpoint)).json();
      assert.equal(after.id, before.id);
      assert.equal(after.name, renamed);
      const download = await request(endpoint + '/pdf');
      assert.equal(download.status, 200);
      assert.equal(download.headers.get('content-type'), 'application/pdf');
      const pdf = await PDFDocument.load(await download.arrayBuffer());
      assert.equal(pdf.getPageCount(), 1);
      assert.deepEqual(pdf.getPage(0).getSize(), dimensions);
      assert.equal(pdf.getTitle(), (event.startsWith('orca') ? 'Orcathon' : 'Innovative India') + ' Certificate — ' + renamed);
      assert.equal(pdf.getPage(0).node.Resources().lookup(PDFName.of('XObject'), PDFDict).entries().length, 1);
      const account = await db.getUserById(user.id);
      assert.equal(account.full_name, user.full_name);
      assert.equal(account.certificate_name, user.certificate_name);
      assert.equal(account.email, user.email);
      const participant = await db.findParticipantByEmail(user.email, event);
      assert.equal(participant.candidate_name, 'Original Participant');
      assert.equal(participant.is_eligible, 1);
      db.db.prepare("UPDATE issued_certificates SET status='Revoked' WHERE credential_id=?").run(before.id);
      assert.equal((await request(endpoint + '/pdf')).status, 403);
      assert.equal((await request(endpoint + '/name', { method: 'PATCH', body: JSON.stringify({ name: 'Cannot replace revoked' }) })).status, 403);
    });
  }
});
