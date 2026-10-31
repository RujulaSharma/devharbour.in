// Read-only Supabase verification. Only Redis cache keys are changed.
require('dotenv').config();
const assert = require('node:assert/strict');
const { courseCache } = require('../server/course-cache');
const { redis } = require('../server/redis');
const { getPrisma } = require('../server/prisma');
const base = `http://127.0.0.1:${process.env.PORT || 3000}`;
async function get(route) {
  const response = await fetch(base + route);
  assert.equal(response.status, 200);
  return { data: await response.json(), cache: response.headers.get('x-course-cache') };
}
(async () => {
  try {
    const health = await get('/api/health');
    assert.equal(health.data.database, 'postgresql');
    assert.equal(await courseCache.invalidate(), true);
    const first = await get('/api/courses');
    const second = await get('/api/courses');
    assert.equal(first.cache, 'MISS');
    assert.equal(second.cache, 'HIT');
    assert.deepEqual(first.data, second.data);
    const category = first.data.courses[0]?.category;
    if (category) {
      const filtered = await get(`/api/courses?category=${encodeURIComponent(category)}`);
      assert.ok(filtered.data.courses.every(course => course.category === category));
    }
    for (const route of ['/api/challenges', '/api/projects', '/api/leaderboard', '/api/achievements', '/api/certificates/stats']) await get(route);
    assert.equal((await fetch(base + '/api/auth/me')).status, 401);
    const counts = await getPrisma().$transaction(async tx => {
      await tx.$executeRaw`SET TRANSACTION READ ONLY`;
      return { courses: await tx.courses.count(), users: await tx.users.count(), certificates: await tx.issued_certificates.count() };
    }, { maxWait: 10000, timeout: 20000 });
    console.log('Live Express API: course MISS → HIT, category filter, public APIs and unauthenticated access checks passed.');
    console.log('Prisma read-only Supabase transaction passed:', JSON.stringify(counts));
  } finally { redis.close(); await getPrisma().$disconnect(); }
})().catch(() => { console.error('Read-only backend verification failed; credentials withheld.'); process.exitCode = 1; });
