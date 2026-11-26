/**
 * Dev Harbour — Distributed & Resilient Rate Limiting Layer
 * Supports Redis when configured (REDIS_URL) with seamless in-memory fallback.
 * Prevents DDoS, brute-force attacks, and credential stuffing.
 */

require('dotenv').config();

let Redis = null;
try {
  Redis = require('ioredis');
} catch {
  Redis = null;
}

let redisClient = null;
let isRedisReady = false;

if (Redis && process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      lazyConnect: true,
      enableOfflineQueue: false,
      retryStrategy: attempt => (process.env.NODE_ENV === 'test' ? null : Math.min(250 * attempt, 5000))
    });

    redisClient.on('ready', () => {
      isRedisReady = true;
      console.log('⚡ Connected to Redis for distributed rate limiting.');
    });

    redisClient.on('close', () => {
      isRedisReady = false;
    });

    redisClient.on('error', () => {
      // Suppress unhandled error log on local dev where Redis might not be running
    });

    // Try connecting once non-blockingly
    redisClient.connect().catch(() => {
      isRedisReady = false;
    });
  } catch (err) {
    isRedisReady = false;
  }
}

// In-Memory Fallback Map
const memoryStore = new Map();

// Periodic cleanup of expired entries in memory store
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryStore.entries()) {
    if (now > value.resetTime) {
      memoryStore.delete(key);
    }
  }
}, 60000).unref();

function getClientIp(req) {
  if (req.ip) return req.ip;
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

// Authentication counters live with the application database so every Vercel instance
// observes the same limit, including during Redis restarts.
async function checkAuthLimit(req, res, next, windowMs, max, message) {
  const { pool } = require('./db-postgres');
  const { createHash } = require('node:crypto');
  const route = req.route.path;
  const identifier = req.body?.email || req.body?.login;
  const buckets = ['ip:' + getClientIp(req)];
  if (typeof identifier === 'string' && identifier.trim()) {
    buckets.push('account:' + identifier.trim().toLowerCase());
  }
  try {
    const keys = buckets.map(bucket => createHash('sha256').update(route + ':' + bucket).digest('hex')).sort();
    const result = await pool.query(`
      INSERT INTO auth_rate_limits (key, hits, expires_at)
      SELECT key, 1, now() + $2 * interval '1 millisecond' FROM unnest($1::text[]) AS key ORDER BY key
      ON CONFLICT (key) DO UPDATE
        SET hits = CASE WHEN auth_rate_limits.expires_at <= now() THEN 1 ELSE auth_rate_limits.hits + 1 END,
            expires_at = CASE WHEN auth_rate_limits.expires_at <= now() THEN excluded.expires_at ELSE auth_rate_limits.expires_at END
      RETURNING hits, ceil(extract(epoch FROM expires_at - now())) AS wait_seconds`, [keys, windowMs]);
    // Remove stale counters in bounded batches, keeping the expiry index small.
    await pool.query('DELETE FROM auth_rate_limits WHERE key IN (SELECT key FROM auth_rate_limits WHERE expires_at < now() LIMIT 32) AND expires_at < now()');
    const limited = result.rows.filter(row => row.hits > max);
    if (limited.length) {
      const retryAfter = Math.max(1, ...limited.map(row => Number(row.wait_seconds)));
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({ error: message, retryAfter });
    }
    return next();
  } catch {
    return res.status(503).json({ error: 'Sign-in is temporarily unavailable. Please try again.' });
  }
}

function rateLimit({ windowMs = 60000, max = 15, message = 'Too many requests. Please try again later.' } = {}) {
  const effectiveMax = process.env.NODE_ENV === 'test' ? Math.max(max, 100) : max;
  return async (req, res, next) => {
    if (req.baseUrl.toLowerCase() === '/api/auth' && (process.env.NODE_ENV === 'production' || process.env.VERCEL)) {
      return checkAuthLimit(req, res, next, windowMs, max, message);
    }
    const ip = getClientIp(req);
    const key = `ratelimit:${req.baseUrl || ''}${req.route?.path || req.path}:${ip}`;
    const now = Date.now();

    // 1. Try Redis first if healthy
    if (isRedisReady && redisClient) {
      try {
        const current = await redisClient.incr(key);
        if (current === 1) {
          await redisClient.pexpire(key, windowMs);
        }
        const ttl = await redisClient.pttl(key);
        const retryAfter = Math.max(1, Math.ceil(ttl / 1000));

        res.setHeader('X-RateLimit-Limit', effectiveMax);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, effectiveMax - current));

        if (current > effectiveMax) {
          res.setHeader('Retry-After', retryAfter);
          return res.status(429).json({ error: message, retryAfter });
        }
        return next();
      } catch (redisErr) {
        // Fall back to memoryStore below
      }
    }

    // 2. In-Memory Fallback
    let record = memoryStore.get(key);
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      memoryStore.set(key, record);
      res.setHeader('X-RateLimit-Limit', effectiveMax);
      res.setHeader('X-RateLimit-Remaining', effectiveMax - 1);
      return next();
    }

    record.count++;
    const retryAfter = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
    res.setHeader('X-RateLimit-Limit', effectiveMax);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, effectiveMax - record.count));

    if (record.count > effectiveMax) {
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({ error: message, retryAfter });
    }

    next();
  };
}

module.exports = {
  rateLimit,
  getRateLimitRedis: () => redisClient?.status === 'ready' ? redisClient : null,
  isRedisActive: () => isRedisReady
};
