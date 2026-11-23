const { createHmac, timingSafeEqual } = require('node:crypto');
const db = require('./db');
const { indiaDay } = require('./study-rewards');

function signReferral(payload, secret) {
  return createHmac('sha256', secret).update('verified-referral-v1:' + payload).digest('base64url');
}

function referralCode(userId, secret = process.env.EMAIL_VERIFICATION_SECRET) {
  if (!secret) return null;
  const payload = Buffer.from(userId).toString('base64url');
  return payload + '.' + signReferral(payload, secret);
}

function referralOwner(code, secret) {
  if (!secret || typeof code !== 'string' || code.length > 160 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}$/.test(code)) return null;
  const [payload, signature] = code.split('.');
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(signReferral(payload, secret)))) return null;
  return Buffer.from(payload, 'base64url').toString();
}

function mailbox(email) {
  const [local, domain] = email.trim().toLowerCase().split('@');
  return domain === 'gmail.com' || domain === 'googlemail.com'
    ? local.split('+')[0].replaceAll('.', '') + '@gmail.com'
    : email.trim().toLowerCase();
}

async function rewardVerifiedReferral(code, newUser) {
  const owner = referralOwner(code, process.env.EMAIL_VERIFICATION_SECRET);
  if (!owner || owner === newUser.id) return;
  try {
    const inviter = await db.getUserById(owner);
    if (!inviter || mailbox(inviter.email) === mailbox(newUser.email) || !await db.isEmailVerified(owner)) return;
    await db.awardXp(owner, 20, 'streak_bonus', 'referral:' + indiaDay(Date.now()), 'A new referral verified their account');
  } catch (error) {
    console.error('[REFERRAL XP]', error.code || error.name);
  }
}

module.exports = { referralCode, rewardVerifiedReferral };
