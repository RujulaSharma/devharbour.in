const { randomUUID, createHash } = require('node:crypto');
const { redis } = require('./redis');

function defaultNamespace() {
  // Separate databases without putting usernames, hostnames or secrets in keys.
  let identity = process.env.DB_PROVIDER || 'postgresql';
  try {
    const url = new URL(process.env.DATABASE_URL);
    identity += `:${url.hostname}:${url.username}:${url.pathname}:${url.searchParams.get('schema') || 'public'}`;
  } catch { identity += `:${process.env.DB_PATH || 'local'}`; }
  return `devharbour:${createHash('sha256').update(identity).digest('hex').slice(0, 16)}`;
}

function createCourseCache({ connection = redis, namespace = process.env.REDIS_CACHE_NAMESPACE || defaultNamespace(), ttlSeconds = Number(process.env.REDIS_CACHE_TTL_SECONDS || 300) } = {}) {
  const ttl = Number.isFinite(ttlSeconds) ? Math.max(1, Math.min(86400, Math.floor(ttlSeconds))) : 300;
  const generationKey = `${namespace}:courses:generation`;
  const inFlight = new Map();
  let pendingInvalidation = false;

  async function invalidate() {
    pendingInvalidation = true;
    const changed = await connection.run(client => client.set(generationKey, randomUUID()));
    if (changed.ok) pendingInvalidation = false;
    return changed.ok;
  }
  async function generation() {
    // If Redis was down during a course edit, invalidate before reading it again.
    if (pendingInvalidation && !await invalidate()) return null;
    const result = await connection.run(async client => {
      const existing = await client.get(generationKey);
      if (existing) return existing;
      // UUID generations remain safe if the generation key is evicted/recreated.
      await client.set(generationKey, randomUUID(), { NX: true });
      return client.get(generationKey);
    });
    return result.ok ? result.value : null;
  }
  async function list(category, load) {
    const version = await generation();
    if (!version) return { courses: await load(), cache: 'BYPASS' };
    const categoryHash = createHash('sha256').update(category).digest('hex');
    const key = `${namespace}:courses:${version}:${categoryHash}`;
    const cached = await connection.run(client => client.get(key));
    if (!cached.ok) return { courses: await load(), cache: 'BYPASS' };
    if (cached.value !== null) {
      try {
        const courses = JSON.parse(cached.value);
        if (Array.isArray(courses)) return { courses, cache: 'HIT' };
      } catch { /* Corrupt cache entries are replaced from the database. */ }
    }
    if (inFlight.has(key)) return inFlight.get(key);
    const loading = (async () => {
      const courses = await load();
      // The generation is part of the key, so a racing edit cannot repopulate
      // the new generation with results read before its transaction committed.
      const saved = await connection.run(client => client.set(key, JSON.stringify(courses), { EX: ttl }));
      return { courses, cache: saved.ok ? 'MISS' : 'BYPASS' };
    })();
    inFlight.set(key, loading);
    try { return await loading; } finally { inFlight.delete(key); }
  }
  return { list, invalidate, generationKey, namespace, ttl };
}

const courseCache = createCourseCache();
module.exports = { courseCache, createCourseCache };
