const crypto = require('node:crypto');
const { generateOtp, hashOtp, verifyOtpHash, sendVerificationOtpEmail, isConfigured } = require('./email');

function passwordVersion(user) {
  return crypto.createHash('sha256').update(user.password_hash).digest('hex');
}
function unavailable() {
  return Object.assign(new Error('Login codes are temporarily unavailable.'), { status: 503 });
}
function createPostgresLoginCodes({ query, sendEmail = sendVerificationOtpEmail }) {
  return {
    async send(user) {
      if (!isConfigured()) {
        console.error('[LOGIN CODE] Resend configuration is incomplete');
        throw unavailable();
      }
      const id = crypto.randomUUID(), code = generateOtp();
      const created = await query(`INSERT INTO auth_login_challenges
        (user_id,challenge_id,code_hash,password_version,attempts_remaining,sent_at,expires_at,consumed_at)
        VALUES ($1,$2,$3,$4,5,now(),now()+interval '10 minutes',NULL)
        ON CONFLICT (user_id) DO UPDATE SET challenge_id=excluded.challenge_id,code_hash=excluded.code_hash,
          password_version=excluded.password_version,attempts_remaining=5,sent_at=excluded.sent_at,
          expires_at=excluded.expires_at,consumed_at=NULL
        WHERE auth_login_challenges.sent_at <= now()-interval '60 seconds'
        RETURNING challenge_id`, [user.id, id, hashOtp(user.id, id, code), passwordVersion(user)]);
      if (!created.rows.length) throw Object.assign(new Error('Wait one minute before requesting a new code.'), { status: 429 });
      try {
        await sendEmail({ email: user.email, code, challengeId: id, purpose: 'login' });
      } catch (error) {
        await query('DELETE FROM auth_login_challenges WHERE user_id=$1 AND challenge_id=$2', [user.id, id]);
        console.error('[LOGIN CODE] Delivery failed', error.providerStatus || error.name);
        throw unavailable();
      }
      return id;
    },
    async consume(id, code, getUser) {
      const result = await query(`SELECT user_id,code_hash,password_version FROM auth_login_challenges
        WHERE challenge_id=$1 AND consumed_at IS NULL AND attempts_remaining>0 AND expires_at>now()`, [id]);
      const challenge = result.rows[0];
      if (!challenge) return null;
      const user = await getUser(challenge.user_id);
      if (!user || user.id !== challenge.user_id || passwordVersion(user) !== challenge.password_version) {
        await query('UPDATE auth_login_challenges SET consumed_at=now(),code_hash=NULL WHERE challenge_id=$1', [id]);
        return null;
      }
      if (!verifyOtpHash(challenge.code_hash, user.id, id, code)) {
        await query(`UPDATE auth_login_challenges SET attempts_remaining=attempts_remaining-1,
          code_hash=CASE WHEN attempts_remaining<=1 THEN NULL ELSE code_hash END,
          consumed_at=CASE WHEN attempts_remaining<=1 THEN now() ELSE consumed_at END
          WHERE challenge_id=$1 AND consumed_at IS NULL AND attempts_remaining>0 AND expires_at>now()`, [id]);
        return null;
      }
      // The conditional update consumes once across workers and rechecks password resets atomically.
      const accepted = await query(`UPDATE auth_login_challenges SET consumed_at=now(),code_hash=NULL
        WHERE challenge_id=$1 AND user_id=$2 AND code_hash=$3 AND password_version=$4
          AND consumed_at IS NULL AND attempts_remaining>0 AND expires_at>now()
          AND EXISTS(SELECT 1 FROM users u WHERE u.id=$2 AND u.password_hash=$5)
        RETURNING user_id`, [id, user.id, challenge.code_hash, challenge.password_version, user.password_hash]);
      return accepted.rows.length === 1 ? user : null;
    }
  };
}

module.exports = { createPostgresLoginCodes, passwordVersion };
