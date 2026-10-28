const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID, createHash } = require('node:crypto');
process.env.NODE_ENV = 'test';
const { createRedisConnection } = require('../server/redis');
const { createCourseCache } = require('../server/course-cache');
const { withCourseInvalidation } = require('../server/course-cache-prisma');

test('Optional Redis public-course cache', { skip: process.env.RUN_REDIS_TESTS !== 'true' }, async t => {
  const connection = createRedisConnection({ url: process.env.REDIS_URL });
  const namespace = `devharbour:test:${randomUUID()}`;
  const cache = createCourseCache({ connection, namespace, ttlSeconds: 2 });
  t.after(async () => {
    // Only this run's private test namespace; never FLUSHDB/FLUSHALL.
    await connection.run(async client => {
      for await (const keys of client.scanIterator({ MATCH: `${namespace}*`, COUNT: 100 })) {
        if (keys.length) await client.del(keys);
      }
    });
    connection.close();
  });
  const ping = await connection.run(client => client.ping());
  assert.equal(ping.value, 'PONG');
  let rows = [{ id: 'test-course', category: 'Web', title: 'Before edit' }];
  let loads = 0;
  const load = async () => { loads++; return structuredClone(rows); };

  await t.test('Cache miss, hit and category separation', async () => {
    assert.equal((await cache.list('All', load)).cache, 'MISS');
    assert.equal((await cache.list('All', load)).cache, 'HIT');
    assert.equal(loads, 1);
    assert.equal((await cache.list('Web', load)).cache, 'MISS');
    assert.equal(loads, 2);
    const version = (await connection.run(client => client.get(cache.generationKey))).value;
    const key = `${namespace}:courses:${version}:${createHash('sha256').update('All').digest('hex')}`;
    const ttl = await connection.run(client => client.ttl(key));
    assert.ok(ttl.value > 0 && ttl.value <= 2);
  });
  await t.test('Invalidation refreshes all category listings', async () => {
    rows = [{ ...rows[0], title: 'After edit' }];
    assert.equal(await cache.invalidate(), true);
    for (const category of ['All', 'Web']) {
      const refreshed = await cache.list(category, load);
      assert.equal(refreshed.cache, 'MISS');
      assert.equal(refreshed.courses[0].title, 'After edit');
    }
  });
  await t.test('TTL expiry forces a reload', async () => {
    const short = createCourseCache({ connection, namespace: `${namespace}:expiry`, ttlSeconds: 1 });
    assert.equal((await short.list('All', load)).cache, 'MISS');
    await new Promise(resolve => setTimeout(resolve, 1100));
    assert.equal((await short.list('All', load)).cache, 'MISS');
  });
  await t.test('A read racing an edit cannot repopulate the current generation', async () => {
    let release;
    let started;
    const waiting = new Promise(resolve => { started = resolve; });
    const first = cache.list('Race', () => {
      started();
      return new Promise(resolve => { release = resolve; });
    });
    await waiting;
    await cache.invalidate();
    release([{ title: 'Old snapshot' }]);
    await first;
    const latest = await cache.list('Race', async () => [{ title: 'New snapshot' }]);
    assert.equal(latest.cache, 'MISS');
    assert.equal(latest.courses[0].title, 'New snapshot');
  });
  await t.test('Database loader errors propagate instead of serving fake results', async () => {
    await assert.rejects(cache.list('LoaderError', async () => { throw new Error('Database unavailable'); }), /Database unavailable/);
  });
  await t.test('Missing Redis and refused connections bypass the cache promptly', async () => {
    for (const url of [undefined, 'redis://127.0.0.1:1']) {
      const unavailable = createRedisConnection({ url, connectTimeoutMs: 100, retryDelayMs: 20 });
      try {
        const bypass = createCourseCache({ connection: unavailable, namespace });
        const start = Date.now();
        const result = await bypass.list('All', load);
        assert.equal(result.cache, 'BYPASS');
        assert.deepEqual(result.courses, rows);
        assert.ok(Date.now() - start < 1500);
      } finally { unavailable.close(); }
    }
  });
  await t.test('Stalled Redis commands have a deadline', async () => {
    const stalled = createRedisConnection({ url: process.env.REDIS_URL, commandTimeoutMs: 75 });
    try {
      const start = Date.now();
      assert.equal((await stalled.run(() => new Promise(() => {}))).ok, false);
      assert.ok(Date.now() - start < 1500);
    } finally { stalled.close(); }
  });
  await t.test('A missed invalidation is retried before reads after recovery', async () => {
    let online = false;
    const recovering = createCourseCache({ namespace: `${namespace}:recovery`, connection: {
      run: operation => online ? connection.run(operation) : Promise.resolve({ ok: false }),
    } });
    assert.equal(await recovering.invalidate(), false);
    assert.equal((await recovering.list('All', load)).cache, 'BYPASS');
    online = true;
    assert.equal((await recovering.list('All', load)).cache, 'MISS');
    assert.equal((await recovering.list('All', load)).cache, 'HIT');
  });
});

// These write-path tests simulate Prisma operations locally. They never write to
// Supabase, while exercising exactly the extension hooks used by the backend.
test('Prisma course-write invalidation happens only after successful commit', async () => {
  const events = [];
  let hook;
  const fake = {
    $extends(extension) {
      hook = extension.query.courses.$allOperations;
      return {
        async $transaction(action) {
          try { const result = await action(); events.push('COMMIT'); return result; }
          catch (error) { events.push('ROLLBACK'); throw error; }
        },
      };
    },
  };
  const client = withCourseInvalidation(fake, async () => events.push('INVALIDATE'));
  const write = operation => hook({ operation, args: {}, query: async () => { events.push('QUERY'); return 1; } });
  await write('findMany');
  assert.deepEqual(events.splice(0), ['QUERY']);
  for (const operation of ['create', 'update', 'delete', 'upsert', 'createMany', 'updateMany', 'deleteMany']) {
    await write(operation);
    assert.deepEqual(events.splice(0), ['QUERY', 'INVALIDATE']);
  }
  await client.$transaction(async () => { await write('update'); await write('create'); });
  assert.deepEqual(events.splice(0), ['QUERY', 'QUERY', 'COMMIT', 'INVALIDATE']);
  await assert.rejects(client.$transaction(async () => { await write('update'); throw new Error('abort'); }));
  assert.deepEqual(events.splice(0), ['QUERY', 'ROLLBACK']);
  const failingInvalidation = withCourseInvalidation(fake, async () => { throw new Error('Redis down'); });
  assert.equal(await write('update'), 1);
  await failingInvalidation.$transaction(async () => write('update'));
});
