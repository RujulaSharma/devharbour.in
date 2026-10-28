// Local-only secret generation; never prints passwords or connection strings.
const fs = require('node:fs');
const crypto = require('node:crypto');
const dotenv = require('dotenv');
fs.mkdirSync('.local/redis', { recursive: true });
const secretFile = '.local/redis/password';
if (!fs.existsSync(secretFile)) fs.writeFileSync(secretFile, crypto.randomBytes(32).toString('hex'), { mode: 0o600, flag: 'wx' });
const password = fs.readFileSync(secretFile, 'utf8').trim();
if (!/^[a-f0-9]{64}$/.test(password)) throw new Error('Existing Redis secret has an unexpected format; it was preserved.');
const existing = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';
let content = existing;
const parsed = dotenv.parse(content);
const url = `redis://default:${password}@127.0.0.1:6379/0`;
if (parsed.REDIS_URL && parsed.REDIS_URL !== url) throw new Error('An existing REDIS_URL differs from the local Redis secret; both were preserved.');
for (const [key, value] of Object.entries({ REDIS_URL: url, REDIS_CACHE_TTL_SECONDS: '300' })) {
  if (parsed[key]) continue;
  const line = `${key}=${JSON.stringify(value)}`;
  const pattern = new RegExp(`^${key}=.*$`, 'm');
  content = pattern.test(content) ? content.replace(pattern, () => line) : `${content}\n${line}\n`;
}
if (content !== existing) {
  if (existing) fs.writeFileSync(`.local/env.before-redis-${Date.now()}.backup`, existing, { mode: 0o600, flag: 'wx' });
  fs.writeFileSync('.env', content, { mode: 0o600 });
}
console.log('Redis secret and local REDIS_URL configured. No credentials displayed.');
