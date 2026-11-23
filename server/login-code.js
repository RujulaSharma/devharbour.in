const crypto = require('node:crypto');
const { generateOtp, hashOtp, sendVerificationOtpEmail, isConfigured } = require('./email');
const { getRateLimitRedis } = require('./rate-limiter');

const challengePrefix = 'auth:login-code:';
const lifetimeSeconds = 600;

function unavailable() {
  return Object.assign(new Error('Login codes are temporarily unavailable.'), { status: 503 });
}

function passwordVersion(user) {
  return crypto.createHash('sha256').update(user.password_hash).digest('hex');
}

async function sendLoginCode(user) {
  const redis = getRateLimitRedis();
  if (!redis || !isConfigured()) {
    console.error('[LOGIN CODE]', redis ? 'Resend configuration is incomplete' : 'Redis is not ready');
    throw unavailable();
  }
  const id = crypto.randomUUID();
  const cooldownKey = 'auth:login-cooldown:' + user.id;
  const cooldown = await redis.set(cooldownKey, id, 'EX', 60, 'NX');
  if (!cooldown) {
    throw Object.assign(new Error('Wait one minute before requesting a new code.'), { status: 429 });
  }
  const code = generateOtp();
  const key = challengePrefix + id;
  await redis.set(key, JSON.stringify({
    userId: user.id,
    passwordVersion: passwordVersion(user),
    hash: hashOtp(user.id, id, code),
    remaining: 5
  }), 'EX', lifetimeSeconds);
  try {
    await sendVerificationOtpEmail({ email: user.email, code, challengeId: id, purpose: 'login' });
  } catch (error) {
    console.error('[LOGIN CODE] Resend rejected or timed out on delivery', error.providerStatus || error.name);
    await redis.eval(`
      redis.call('DEL', KEYS[1])
      if redis.call('GET', KEYS[2]) == ARGV[1] then redis.call('DEL', KEYS[2]) end
    `, 2, key, cooldownKey, id);
    throw unavailable();
  }
  return id;
}

async function consumeLoginCode(id, code, getUser) {
  const redis = getRateLimitRedis();
  if (!redis) throw unavailable();
  const key = challengePrefix + id;
  const raw = await redis.get(key);
  if (!raw) return null;
  const challenge = JSON.parse(raw);
  const user = await getUser(challenge.userId);
  if (!user || passwordVersion(user) !== challenge.passwordVersion) return null;
  const accepted = await redis.eval(`
    local raw = redis.call('GET', KEYS[1])
    if not raw then return 0 end
    local challenge = cjson.decode(raw)
    if challenge.hash == ARGV[1] then
      redis.call('DEL', KEYS[1])
      return 1
    end
    challenge.remaining = challenge.remaining - 1
    if challenge.remaining <= 0 then
      redis.call('DEL', KEYS[1])
    else
      redis.call('SET', KEYS[1], cjson.encode(challenge), 'KEEPTTL')
    end
    return 0
  `, 1, key, hashOtp(user.id, id, code));
  return accepted === 1 ? user : null;
}

module.exports = { sendLoginCode, consumeLoginCode };
