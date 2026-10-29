// Read-only ownership lookup. Never create certificates from this path.
const EVENT = 'orca-coders-orcathon-2026';
async function findMine(user, database = require('./database')) {
  const email = user.email.trim().toLowerCase();
  let rows, eligible;
  if (database.provider === 'postgresql') {
    const prisma = require('./prisma').getPrisma();
    rows = await prisma.$queryRaw`
      SELECT c.* FROM issued_certificates c JOIN event_participants p ON p.id = c.participant_id
      WHERE lower(trim(p.candidate_email)) = ${email} AND lower(trim(c.recipient_email)) = ${email}
      AND p.event_slug = ${EVENT} AND c.event_slug = ${EVENT} AND p.is_eligible = 1 AND c.status = 'Valid'
      ORDER BY c.credential_id`;
    eligible = await prisma.$queryRaw`SELECT id FROM event_participants WHERE lower(trim(candidate_email)) = ${email} AND event_slug = ${EVENT} AND is_eligible = 1 LIMIT 1`;
  } else {
    rows = database.db.prepare(`SELECT c.* FROM issued_certificates c JOIN event_participants p ON p.id = c.participant_id
      WHERE lower(trim(p.candidate_email)) = ? AND lower(trim(c.recipient_email)) = ?
      AND p.event_slug = ? AND c.event_slug = ? AND p.is_eligible = 1 AND c.status = 'Valid' ORDER BY c.credential_id`).all(email, email, EVENT, EVENT);
    eligible = database.db.prepare('SELECT id FROM event_participants WHERE lower(trim(candidate_email)) = ? AND event_slug = ? AND is_eligible = 1 LIMIT 1').all(email, EVENT);
  }
  const certificates = rows.map(c => ({
    credential_id: c.credential_id, recipient_name: c.recipient_name,
    recipient_organisation: c.recipient_organisation, certificate_type: c.certificate_type,
    event_name: 'ORCA CODERS: ORCATHON 2026', event_slug: c.event_slug,
    issue_date: c.issue_date, status: c.status,
    verification_url: `/certificate/verify/${encodeURIComponent(c.credential_id)}`,
  }));
  return { certificates, message: certificates.length ? 'Your existing official certificates.' : eligible.length
    ? 'Your registration is eligible, but no valid issued certificate is available. Contact the organiser.'
    : 'No eligible registration matches your verified email. Use the email registered for the event or contact the organiser.' };
}
module.exports = { findMine };
