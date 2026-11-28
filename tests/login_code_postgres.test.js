process.env.NODE_ENV = 'test';
process.env.RESEND_API_KEY = 're_fixture_only';
process.env.EMAIL_FROM = 'fixture@example.test';
process.env.EMAIL_VERIFICATION_SECRET = 'fixture-login-code-secret-at-least-32-characters';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PGlite } = require('@electric-sql/pglite');
const { createPostgresLoginCodes } = require('../server/login-code-postgres');

test('PostgreSQL sign-in challenges retain OTP security without a Redis dependency', async t => {
  const pg = new PGlite();
  t.after(() => pg.close());
  await pg.exec('CREATE TABLE users(id text PRIMARY KEY,email text,password_hash text); CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE devharbour_web;');
  const schema = fs.readFileSync(path.join(__dirname, '../server/login-code-postgres.sql'), 'utf8');
  await pg.exec(schema);
  await pg.exec(schema);
  const deliveries = [];
  let failDelivery = false;
  const store = createPostgresLoginCodes({ query: (text, args) => pg.query(text, args), sendEmail: async message => {
    if (failDelivery) throw Error('Fixture delivery failure');
    deliveries.push(message);
  } });
  const make = async name => {
    const user = { id: name, email: name + '@example.test', password_hash: 'fixture-password-hash-' + name };
    await pg.query('INSERT INTO users(id,email,password_hash) VALUES($1,$2,$3)', [user.id, user.email, user.password_hash]);
    return user;
  };
  const getUser = async id => (await pg.query('SELECT * FROM users WHERE id=$1', [id])).rows[0];

  await t.test('codes are hashed, expire in ten minutes and concurrent resend is limited', async () => {
    const user = await make('concurrent');
    const results = await Promise.allSettled(Array.from({ length: 4 }, () => store.send(user)));
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    assert(results.filter(result => result.status === 'rejected').every(result => result.reason.status === 429));
    const row = (await pg.query('SELECT *,extract(epoch FROM expires_at-sent_at)::int AS lifetime FROM auth_login_challenges WHERE user_id=$1', [user.id])).rows[0];
    assert.match(row.code_hash, /^[a-f0-9]{64}$/);
    assert.notEqual(row.code_hash, deliveries.at(-1).code);
    assert.equal(row.lifetime, 600);
    assert.equal(row.attempts_remaining, 5);
  });
  await t.test('concurrent confirmations consume exactly once and retain the resend cooldown', async () => {
    const user = await make('consume_once'), id = await store.send(user), code = deliveries.at(-1).code;
    const results = await Promise.all([store.consume(id, code, getUser), store.consume(id, code, getUser)]);
    assert.equal(results.filter(Boolean).length, 1);
    assert.equal(await store.consume(id, code, getUser), null);
    await assert.rejects(store.send(user), error => error.status === 429);
  });
  await t.test('five incorrect attempts invalidate the challenge', async () => {
    const user = await make('attempts'), id = await store.send(user), code = deliveries.at(-1).code;
    for (let n = 0; n < 5; n++) assert.equal(await store.consume(id, '000000', getUser), null);
    assert.equal(await store.consume(id, code, getUser), null);
    const row = (await pg.query('SELECT attempts_remaining,code_hash,consumed_at FROM auth_login_challenges WHERE user_id=$1', [user.id])).rows[0];
    assert.equal(row.attempts_remaining, 0); assert.equal(row.code_hash, null); assert(row.consumed_at);
  });
  await t.test('expired and password-reset challenges cannot create a session', async () => {
    for (const kind of ['expired', 'reset']) {
      const user = await make(kind), id = await store.send(user), code = deliveries.at(-1).code;
      if (kind === 'expired') await pg.query("UPDATE auth_login_challenges SET expires_at=now()-interval '1 second' WHERE user_id=$1", [user.id]);
      else await pg.query('UPDATE users SET password_hash=$1 WHERE id=$2', ['new-password-hash', user.id]);
      assert.equal(await store.consume(id, code, getUser), null);
    }
  });
  await t.test('resending after cooldown invalidates the older challenge', async () => {
    const user = await make('resend'), oldId = await store.send(user), oldCode = deliveries.at(-1).code;
    await pg.query("UPDATE auth_login_challenges SET sent_at=now()-interval '61 seconds' WHERE user_id=$1", [user.id]);
    const id = await store.send(user), code = deliveries.at(-1).code;
    assert.notEqual(id, oldId);
    assert.equal(await store.consume(oldId, oldCode, getUser), null);
    assert.equal((await store.consume(id, code, getUser)).id, user.id);
  });
  await t.test('failed delivery removes only the pending test challenge and permits retry', async () => {
    const user = await make('failed_delivery'); failDelivery = true;
    try { await assert.rejects(store.send(user), error => error.status === 503); }
    finally { failDelivery = false; }
    assert.equal((await pg.query('SELECT * FROM auth_login_challenges WHERE user_id=$1', [user.id])).rows.length, 0);
    assert(await store.send(user));
  });
  await t.test('a password change between lookup and consumption is rejected atomically', async () => {
    const user = await make('racing_reset'), id = await store.send(user), code = deliveries.at(-1).code;
    const racingGetUser = async key => { const previous = await getUser(key); await pg.query('UPDATE users SET password_hash=$1 WHERE id=$2', ['replacement-hash', key]); return previous; };
    assert.equal(await store.consume(id, code, racingGetUser), null);
  });
  await t.test('browser database roles cannot read sign-in challenges', async () => {
    for (const role of ['anon', 'authenticated']) {
      await pg.exec('SET ROLE ' + role);
      try { await assert.rejects(pg.query('SELECT * FROM auth_login_challenges'), error => error.code === '42501'); }
      finally { await pg.exec('RESET ROLE'); }
    }
    await pg.exec('SET ROLE devharbour_web');
    try { assert((await pg.query('SELECT count(*)::int AS count FROM auth_login_challenges')).rows[0].count > 0); }
    finally { await pg.exec('RESET ROLE'); }
  });
});
