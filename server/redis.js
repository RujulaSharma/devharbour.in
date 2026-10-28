// Server-only, optional Redis connection. Never log connection URLs or errors.
require('dotenv').config();
const { createClient } = require('redis');

function bounded(promise, milliseconds) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Redis deadline exceeded')), milliseconds); }),
  ]).finally(() => clearTimeout(timer));
}

function createRedisConnection({ url, enabled = true, connectTimeoutMs = 500, commandTimeoutMs = 250, retryDelayMs = 5000 } = {}) {
  let client;
  let connecting;
  let retryAfter = 0;
  function discard(target) {
    if (target?.isOpen) target.destroy();
    if (client === target) client = undefined;
    retryAfter = Date.now() + retryDelayMs;
  }
  async function getClient() {
    if (!enabled || !url || Date.now() < retryAfter) return null;
    if (client?.isReady) return client;
    if (connecting) return connecting;
    connecting = (async () => {
      let target;
      try {
        target = createClient({ url, disableOfflineQueue: true,
          socket: { connectTimeout: connectTimeoutMs, reconnectStrategy: false } });
        // node-redis requires an error listener; diagnostics may contain secrets.
        target.on('error', () => {});
        client = target;
        await bounded(target.connect(), connectTimeoutMs + 100);
        return target.isReady ? target : null;
      } catch {
        discard(target);
        return null;
      }
    })();
    try { return await connecting; } finally { connecting = undefined; }
  }
  async function run(operation) {
    const target = await getClient();
    if (!target) return { ok: false };
    try { return { ok: true, value: await bounded(Promise.resolve().then(() => operation(target)), commandTimeoutMs) }; }
    catch { discard(target); return { ok: false }; }
  }
  function close() {
    if (client?.isOpen) client.destroy();
    client = undefined;
  }
  return { run, close };
}

const redis = createRedisConnection({
  url: process.env.REDIS_URL,
  enabled: process.env.REDIS_ENABLED !== 'false' && (process.env.NODE_ENV !== 'test' || process.env.REDIS_TEST_ENABLED === 'true'),
});
module.exports = { redis, createRedisConnection };
