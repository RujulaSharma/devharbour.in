require('dotenv').config();
const { courseCache } = require('../server/course-cache');
const { redis } = require('../server/redis');
(async () => {
  try {
    const changed = await courseCache.invalidate();
    if (!changed) throw new Error('Redis unavailable');
    console.log('Public course-list cache invalidated for all categories.');
  } finally { redis.close(); }
})().catch(() => { console.error('Redis unavailable. Retry invalidation when Redis is running.'); process.exitCode = 1; });
