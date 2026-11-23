// Vercel Serverless Function: GET /api/certificates/verify/:id
// Powered by Supabase PostgreSQL single source of truth

const db = require('../../../server/db');
const { verifyCertificate } = require('../../../server/innovative_certificates');

function maskEmail(email) {
  if (!email || typeof email !== 'string' || !email.includes('@')) return '';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}*@${domain}`;
  const prefix = user.slice(0, 2);
  const suffix = user.slice(-1);
  return `${prefix}${'*'.repeat(Math.max(2, user.length - 3))}${suffix}@${domain}`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query || {};
  if (!id || !String(id).trim()) {
    return res.status(400).json({ error: 'Valid credential ID is required.' });
  }

  if (/^IN-26-/i.test(String(id).trim())) return verifyCertificate(req, res, id);
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    const cert = await db.getIssuedCertificateById(String(id).trim());

    if (!cert) {
      return res.status(404).json({
        error: `Credential ID "${id}" was not found in the authoritative registry.`,
        verified: false
      });
    }

    if (cert.event_slug === 'innovative-india-2026') return res.status(404).json({ verified: false, error: 'Credential ID not found.' });

    return res.json({
      verified: String(cert.status).toLowerCase() === 'valid',
      database: 'Authoritative Credential Registry',
      credential: {
        credential_id: cert.credential_id,
        recipient_name: cert.recipient_name,
        recipient_email: maskEmail(cert.recipient_email),
        recipient_organisation: cert.recipient_organisation || 'Participant',
        event_name: 'ORCA CODERS: ORCATHON 2026',
        event_slug: cert.event_slug,
        certificate_type: cert.certificate_type || 'Participation',
        issue_date: cert.issue_date,
        status: cert.status,
        issuer: 'Dev Harbour Registry',
        issued_at: cert.created_at
      }
    });
  } catch (err) {
    console.error('[VERIFY ERROR]:', err);
    return res.status(500).json({
      error: 'Verification service unavailable.'
    });
  }
};
