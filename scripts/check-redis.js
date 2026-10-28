require('dotenv').config();
const { redis } = require('../server/redis');
(async () => {
  try {
    const result = await redis.run(client => client.ping());
    if (!result.ok || result.value !== 'PONG') throw new Error('Redis unavailable');
    console.log('Redis authenticated PING: PONG');
  } finally { redis.close(); }
})().catch(() => { console.error('Redis check failed. Check Docker and local REDIS_URL; credentials withheld.'); process.exitCode = 1; });
