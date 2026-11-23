const { createHmac, timingSafeEqual } = require('node:crypto');

const focusPoints = new Map([[25, 15], [50, 30], [60, 36]]);
const maxClaimDelay = 2 * 60 * 60 * 1000;

function indiaDay(now) {
  return new Date(now + 330 * 60 * 1000).toISOString().slice(0, 10);
}

function sign(payload, secret) {
  return createHmac('sha256', secret).update('study-focus-v1:' + payload).digest('base64url');
}

function startFocus(userId, minutes, secret, now = Date.now()) {
  if (!focusPoints.has(minutes) || !secret) return null;
  const payload = Buffer.from(JSON.stringify([userId, minutes, now])).toString('base64url');
  return payload + '.' + sign(payload, secret);
}

function canClaimFocus(token, userId, secret, now = Date.now()) {
  if (!secret || typeof token !== 'string' || token.length > 240) return false;
  if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}$/.test(token)) return false;
  const [payload, signature] = token.split('.');
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(sign(payload, secret)))) return false;
  const [owner, minutes, startedAt] = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  const completedAt = startedAt + minutes * 60 * 1000;
  return owner === userId && now >= completedAt && now <= completedAt + maxClaimDelay ? { completedAt, points: focusPoints.get(minutes) } : false;
}

module.exports = { indiaDay, startFocus, canClaimFocus };
