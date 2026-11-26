process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PGlite } = require('@electric-sql/pglite');
const { insertMissingProfiles } = require('../server/profile/provisioning');

test('Bulk profile backfill uses PostgreSQL JSON/timestamp types and preserves existing rows across batches', async t => {
  const pg = new PGlite();
  t.after(() => pg.close());
  await pg.exec('CREATE TABLE users (id text PRIMARY KEY); CREATE ROLE anon; CREATE ROLE authenticated;');
  await pg.exec(fs.readFileSync(path.join(__dirname, '../prisma/migrations/202611240001_developer_profiles/migration.sql'), 'utf8'));
  const users = Array.from({ length: 56 }, (_, n) => ({ id: 'fixture-' + n,
    location: "Original location ' " + n, github_url: 'https://github.com/fixture-' + n }));
  for (const user of users) await pg.query('INSERT INTO users (id) VALUES ($1)', [user.id]);
  await pg.query(`INSERT INTO developer_profiles (user_id,headline,visibility,privacy,version,updated_at)
    VALUES ($1,'Keep edited details','followers','{"certificates":"private"}',12,CURRENT_TIMESTAMP)`, [users[0].id]);
  const before = (await pg.query('SELECT * FROM developer_profiles WHERE user_id=$1', [users[0].id])).rows[0];
  const client = { $executeRawUnsafe: async (sql, ...params) => (await pg.query(sql, params)).affectedRows };
  assert.equal(await insertMissingProfiles(users, client), 55);
  assert.equal(await insertMissingProfiles(users, client), 0);
  const rows = (await pg.query('SELECT * FROM developer_profiles ORDER BY user_id')).rows;
  assert.equal(rows.length, 56);
  assert.deepEqual(rows.find(row => row.user_id === users[0].id), before);
  const seeded = rows.find(row => row.user_id === users[55].id);
  assert.equal(seeded.city, users[55].location);
  assert.equal(seeded.links.github, users[55].github_url);
  assert.equal(seeded.privacy.certificates, 'private');
  assert.equal(seeded.visibility, 'private');
  assert.equal(seeded.discovery, false);
  assert.equal(seeded.version, 0);
  assert(seeded.created_at);
  assert(seeded.updated_at);
});
