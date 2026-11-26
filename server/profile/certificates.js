const db = require('../db');
const ORCATHON = 'orca-coders-orcathon-2026';

async function syncProfileCertificates(userId, token) {
  if (!token) return;
  const session = await db.getSession(token);
  if (!session || session.user_id !== userId || !(await db.isEmailVerified(userId))) return;
  const user = await db.getUserById(userId);
  if (!user) return;
  const email = user.email.trim().toLowerCase();
  const participant = await db.findParticipantByEmail(email, ORCATHON);
  if (participant && [1, true].includes(participant.is_eligible)) {
    const existing = await db.getIssuedCertificateByEmail(email, ORCATHON);
    if (!existing) {
      await db.issueCertificate({
        credentialId: participant.certificate_credential_id || undefined,
        participantId: participant.id,
        recipientName: participant.candidate_name,
        recipientEmail: email,
        recipientOrganisation: participant.candidate_organisation || '',
        eventSlug: ORCATHON,
        certificateType: 'Participation',
        issueDate: 'October 25, 2026',
      });
    }
  }
  // Keep Innovative India's original-name and Google-session checks unchanged.
  await require('../innovative_certificates').syncProfileCertificate(userId, token);
}

async function backfillProfileCertificates({ apply = false } = {}) {
  const unexpired = db.isPostgres() ? 's.expires_at::timestamptz > now()'
    : "datetime(s.expires_at) > datetime('now')";
  const sql = `SELECT u.id,u.certificate_name,e.event_slug,ev.verified_at,
    (SELECT s.token FROM sessions s WHERE s.user_id=u.id AND ${unexpired}
      AND (e.event_slug <> 'innovative-india-2026' OR lower(trim(u.email)) NOT LIKE '%@gmail.com'
           OR s.google_verified_email=lower(trim(u.email)))
      ORDER BY s.created_at DESC LIMIT 1) AS session_token
    FROM users u JOIN event_participants e ON lower(trim(e.candidate_email))=lower(trim(u.email))
      AND e.is_eligible=1 AND e.event_slug IN ('${ORCATHON}','innovative-india-2026')
    LEFT JOIN email_verifications ev ON ev.user_id=u.id
    LEFT JOIN issued_certificates c ON c.event_slug=e.event_slug
      AND lower(trim(c.recipient_email))=lower(trim(u.email))
    WHERE c.credential_id IS NULL ORDER BY u.id,e.event_slug`;
  const missing = db.isPostgres() ? (await require('../db-postgres').query(sql)).rows
    : db.db.prepare(sql).all();
  const result = { missing: missing.length, ready: 0, issued: 0,
    awaitingEmailVerification: 0, awaitingOriginalName: 0, awaitingSignIn: 0 };
  const synced = new Set();
  for (const row of missing) {
    if (!row.verified_at) { result.awaitingEmailVerification++; continue; }
    if (row.event_slug === 'innovative-india-2026' && !row.certificate_name?.trim()) {
      result.awaitingOriginalName++; continue;
    }
    if (!row.session_token) { result.awaitingSignIn++; continue; }
    result.ready++;
    if (apply) {
      if (!synced.has(row.id)) {
        await syncProfileCertificates(row.id, row.session_token);
        synced.add(row.id);
      }
      const user = await db.getUserById(row.id);
      const cert = await db.getIssuedCertificateByEmail(user.email, row.event_slug);
      if (cert && String(cert.status).toLowerCase() === 'valid') result.issued++;
    }
  }
  return result;
}

module.exports = { syncProfileCertificates, backfillProfileCertificates };
