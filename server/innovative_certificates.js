const db = require('./db');
const { getAuthToken } = require('./auth');
const { generateCertificatePdf } = require('./certificate_generator');

const EVENT = 'innovative-india-2026';
const ID = /^IN-26-\d{7}$/;
const NO_CERTIFICATE = 'We could not find an eligible registration for this account. Sign in with the email you used for Innovative India.';

function issuanceQuery(formatId, idPattern, participantId, requestedId) {
  return `
    WITH participant AS (
      SELECT id, candidate_organisation, certificate_credential_id, is_eligible
      FROM event_participants WHERE event_slug = '${EVENT}' AND lower(trim(candidate_email)) = $1
    ), existing AS (
      SELECT credential_id, participant_id, recipient_organisation, issue_date, status
      FROM issued_certificates WHERE event_slug = '${EVENT}' AND lower(trim(recipient_email)) = $1
    ), numbered AS (
      SELECT credential_id AS id FROM issued_certificates
      UNION ALL
      SELECT certificate_credential_id FROM event_participants WHERE event_slug = '${EVENT}'
    ), next_number AS (
      SELECT coalesce(max(cast(substr(id, 7) AS integer)), 0) + 1 AS value
      FROM numbered WHERE ${idPattern}
    )
    INSERT INTO issued_certificates
      (credential_id, event_slug, participant_id, recipient_name, recipient_email,
       recipient_organisation, certificate_type, issue_date, status, owner_user_id)
    SELECT coalesce(existing.credential_id, participant.certificate_credential_id, 'IN-26-' || ${formatId}),
      '${EVENT}', coalesce(${participantId}, existing.participant_id), $2, $1,
      coalesce(existing.recipient_organisation, participant.candidate_organisation, 'Participant'),
      'Participation', coalesce(existing.issue_date, $5), 'Valid', $3
    FROM next_number LEFT JOIN participant ON true LEFT JOIN existing ON true
    WHERE (cast(participant.is_eligible AS text) IN ('1', 'true')
           OR (participant.id IS NULL AND existing.credential_id IS NOT NULL))
      AND (existing.credential_id IS NULL OR lower(existing.status) = 'valid')
      AND (existing.credential_id IS NOT NULL OR participant.certificate_credential_id IS NOT NULL OR next_number.value <= 9999999)
      AND (${requestedId} IS NULL OR $4 = coalesce(existing.credential_id, participant.certificate_credential_id))
    ON CONFLICT (credential_id) DO UPDATE
      SET owner_user_id = excluded.owner_user_id,
          participant_id = coalesce(issued_certificates.participant_id, excluded.participant_id),
          recipient_name = CASE WHEN issued_certificates.owner_user_id IS NULL
            THEN excluded.recipient_name ELSE issued_certificates.recipient_name END
    WHERE issued_certificates.event_slug = '${EVENT}'
      AND lower(trim(issued_certificates.recipient_email)) = excluded.recipient_email
      AND lower(issued_certificates.status) = 'valid'
      AND (issued_certificates.owner_user_id IS NULL OR issued_certificates.owner_user_id = excluded.owner_user_id)
    RETURNING credential_id, recipient_name, issue_date, status`;
}

const postgresIssue = issuanceQuery("lpad(next_number.value::text, 7, '0')", "id ~ '^IN-26-[0-9]{7}$'", 'participant.id::text', '$4::text');
const sqliteIssue = issuanceQuery("printf('%07d', next_number.value)", "id GLOB 'IN-26-[0-9][0-9][0-9][0-9][0-9][0-9][0-9]'", 'participant.id', '$4');
const verificationSql = `SELECT credential_id, issue_date, status FROM issued_certificates
  WHERE credential_id = $1 AND event_slug = '${EVENT}'`;

async function issueCertificate(database, user, requestedId) {
  const issuedOn = new Date().toISOString().slice(0, 10);
  const params = [user.email.trim().toLowerCase(), user.certificate_name, user.id, requestedId, issuedOn];
  if (database.sqlite) {
    const bindings = Object.fromEntries(params.map((value, i) => [`$${i + 1}`, value]));
    return database.sqlite.prepare(sqliteIssue).get(bindings);
  }
  const client = await database.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(hashtext('innovative-india-2026-issuance'))");
    const { rows } = await client.query(postgresIssue, params);
    await client.query('COMMIT');
    return rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

function publicCredential(cert) {
  return {
    credential_id: cert.credential_id,
    event_name: 'Innovative India',
    event_slug: EVENT,
    certificate_type: 'Participation',
    issue_date: cert.issue_date,
    status: cert.status,
    issuer: 'Dev Harbour · Sponsored by Adaption AI'
  };
}

function myCertificate(mode) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'private, no-store');
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });
    const token = getAuthToken(req);
    if (!token) return res.status(401).json({ error: 'Sign in to access your certificate.' });
    try {
      const database = db.getCertificateDatabase();
      const session = await database.getSession(token);
      const user = session && await database.getUserById(session.user_id);
      if (!user) return res.status(401).json({ error: 'Sign in to access your certificate.' });
      const email = user.email.trim().toLowerCase();
      if (email.endsWith('@gmail.com') && session.google_verified_email !== email) {
        return res.status(403).json({ requiresGoogle: true, error: 'Continue with Google using the Gmail address on your Innovative India registration.' });
      }
      if (!(await database.isEmailVerified(user.id))) {
        return res.status(403).json({ error: 'Verify your account email to access your certificate.', requiresVerification: true, email: user.email });
      }
      const claimEmail = req.headers['x-certificate-email'];
      if (claimEmail !== undefined && claimEmail !== email) {
        return res.status(403).json({ emailMismatch: true, error: 'Use the account that matches the registration email you entered.' });
      }
      if (!user.certificate_name?.trim()) {
        return res.status(409).json({ error: 'Your original signup name is not available. Contact Dev Harbour support to have your original registration checked.' });
      }
      const requestedId = req.params?.credentialId?.toUpperCase() || null;
      if (requestedId && !ID.test(requestedId)) return res.status(404).json({ error: NO_CERTIFICATE });
      const cert = await issueCertificate(database, user, requestedId);
      if (!cert) {
        if (mode === 'details') return res.json({ eligible: false, message: NO_CERTIFICATE });
        return res.status(requestedId ? 403 : 404).json({ error: NO_CERTIFICATE });
      }
      if (mode === 'details') {
        return res.json({
          success: true,
          eligible: true,
          credential: {
            ...publicCredential(cert),
            recipient_name: cert.recipient_name,
            download_url: '/api/certificates/download/my-certificate',
            preview_url: '/api/certificates/preview/my-certificate',
            verification_url: `/verify-certificate?id=${encodeURIComponent(cert.credential_id)}`
          }
        });
      }
      const pdf = await generateCertificatePdf({ recipientName: cert.recipient_name, credentialId: cert.credential_id });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `${mode === 'preview' ? 'inline' : 'attachment'}; filename="DevHarbour-Innovative-India-${cert.credential_id}.pdf"`);
      res.setHeader('Content-Length', pdf.length);
      return res.end(Buffer.from(pdf));
    } catch (error) {
      if (error.code === 'CERTIFICATE_FONT_COVERAGE') {
        return res.status(422).json({ error: 'This signup name needs a supported certificate font. Contact Dev Harbour support for help.' });
      }
      console.error('Innovative India certificate request failed:', error.code || error.name);
      return res.status(503).json({ error: 'The certificate service is temporarily unavailable.' });
    }
  };
}

async function verifyCertificate(req, res, input) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });
  const id = typeof input === 'string' ? input.trim().toUpperCase() : '';
  if (!ID.test(id)) return res.status(400).json({ verified: false, error: 'Enter an Innovative India ID in the format IN-26-0000001.' });
  try {
    const database = db.getCertificateDatabase();
    const cert = database.sqlite
      ? database.sqlite.prepare(verificationSql).get({ $1: id })
      : (await database.pool.query(verificationSql, [id])).rows[0];
    if (!cert) return res.status(404).json({ verified: false, error: 'Credential ID not found.' });
    return res.json({ verified: cert.status.toLowerCase() === 'valid', credential: publicCredential(cert) });
  } catch (error) {
    console.error('Innovative India verification failed:', error.code || error.name);
    return res.status(503).json({ verified: false, error: 'The verification service is temporarily unavailable.' });
  }
}

module.exports = { myCertificate, verifyCertificate, issueCertificate };
