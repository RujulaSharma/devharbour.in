const crypto = require('node:crypto');
const canonical = email => String(email || '').trim().toLowerCase();
const verified = (row, user) => !!row?.verified_at && row.state === 'verified' && row.email === canonical(user.email);
const fail = (status, message) => ({ error: message, status });

function configured(env = process.env) {
  return /^re_[\w-]+$/.test(env.RESEND_API_KEY || '') && /^[a-f0-9]{64,}$/i.test(env.EMAIL_VERIFICATION_SECRET || '') &&
    /^[^\r\n]+<[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+>$/.test(env.EMAIL_FROM || '');
}

async function sendWithResend({ email, code, challengeId }) {
  // Tests must inject a transport. A real local .env key must never send test mail.
  if (process.env.NODE_ENV === 'test' || !configured()) throw Error('EMAIL_NOT_CONFIGURED');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST', signal: AbortSignal.timeout(10000),
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `verify-${challengeId}` },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [email], subject: 'Verify your DevHarbour email',
      text: `Your DevHarbour verification code is ${code}.\n\nIt expires in 10 minutes. Enter it only on DevHarbour. Never share this code.\n\nIf you did not request this, ignore this email.` }),
  });
  if (!response.ok) throw Error('EMAIL_DELIVERY_FAILED');
  const body = await response.json();
  if (typeof body.id !== 'string' || !body.id) throw Error('EMAIL_DELIVERY_FAILED');
}

function createService({ store, sendMail = sendWithResend, now = Date.now,
  randomCode = () => String(crypto.randomInt(0, 1000000)).padStart(6, '0'),
  secret = process.env.EMAIL_VERIFICATION_SECRET, isConfigured = configured } = {}) {
  const digest = (user, challengeId, code) => crypto.createHmac('sha256', secret)
    .update(JSON.stringify([user.id, canonical(user.email), challengeId, code])).digest('hex');
  return {
    async status(user) {
      const row = await store.read(user.id);
      return { email: user.email, verified: verified(row, user), configured: !!isConfigured(),
        retryAfter: Math.max(0, Math.ceil((Date.parse(row?.sent_at || '') + 60000 - now()) / 1000)) || 0 };
    },
    async isVerified(user) { return verified(await store.read(user.id), user); },
    async send(user) {
      if (!isConfigured() || !secret) return fail(503, 'Email verification is not configured. Contact the organiser.');
      const code = randomCode(), challengeId = crypto.randomUUID(), time = now();
      const reservation = await store.mutate(user.id, old => {
        if (verified(old, user)) return { result: { alreadyVerified: true } };
        if (old && time - Date.parse(old.sent_at) < 60000) return { result: fail(429, 'Please wait one minute before requesting another code.') };
        const inHour = old && time - Date.parse(old.hour_started_at) < 3600000;
        if (inHour && old.send_count >= 5) return { result: fail(429, 'Verification email limit reached. Please try again in an hour.') };
        return { row: { user_id: user.id, email: canonical(user.email), challenge_id: challengeId,
          code_hash: digest(user, challengeId, code), expires_at: new Date(time + 600000).toISOString(),
          sent_at: new Date(time).toISOString(), attempts: 0, state: 'pending', verified_at: null,
          hour_started_at: inHour ? old.hour_started_at : new Date(time).toISOString(), send_count: inHour ? old.send_count + 1 : 1 }, result: { reserved: true } };
      });
      if (!reservation.reserved) return reservation;
      let delivered = false;
      try { await sendMail({ email: canonical(user.email), code, challengeId }); delivered = true; } catch { /* Never log provider responses or secrets. */ }
      await store.mutate(user.id, old => {
        if (old?.challenge_id !== challengeId || old.state !== 'pending') return { result: null };
        return { row: { ...old, state: delivered ? 'sent' : 'failed', code_hash: delivered ? old.code_hash : null }, result: null };
      });
      return delivered ? { sent: true, retryAfter: 60, expiresIn: 600 } : fail(503, 'The verification email could not be sent. Please wait one minute and retry.');
    },
    async confirm(user, code) {
      if (!secret || !/^[0-9]{6}$/.test(code || '')) return fail(400, 'Enter the six-digit verification code.');
      return store.mutate(user.id, old => {
        if (verified(old, user)) return { result: { verified: true } };
        if (!old || old.email !== canonical(user.email) || old.state !== 'sent' || !old.code_hash || Date.parse(old.expires_at) <= now() || old.attempts >= 5)
          return { result: fail(400, 'Code unavailable or expired. Request a new code.') };
        const attempts = old.attempts + 1;
        const matches = crypto.timingSafeEqual(Buffer.from(old.code_hash, 'hex'), Buffer.from(digest(user, old.challenge_id, code), 'hex'));
        if (!matches) return { row: { ...old, attempts, state: attempts >= 5 ? 'locked' : 'sent', code_hash: attempts >= 5 ? null : old.code_hash }, result: fail(400, 'Incorrect verification code.') };
        return { row: { ...old, attempts, state: 'verified', code_hash: null, expires_at: null, verified_at: new Date(now()).toISOString() }, result: { verified: true } };
      });
    },
  };
}
let service;
function forRequest(req) {
  return req.app.locals.emailVerificationService || (service ||= createService({ store: require('./email-verification-store').createStore() }));
}
module.exports = { createService, configured, forRequest, sendWithResend };
