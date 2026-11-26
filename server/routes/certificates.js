/**
 * Dev Harbour — Official Certificate Issuance & Verification Routes
 * High-integrity credential registry for ORCA CODERS: ORCATHON 2026.
 * Powered by canonical Supabase PostgreSQL database.
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const db = require('../db');
const { requireAuth } = require('../auth');
const { rateLimit } = require('../rate-limiter');
const { myCertificate, verifyCertificate } = require('../innovative_certificates');

/**
 * Mask email address to protect participant privacy in public endpoints
 */
function maskEmail(email) {
  if (!email || typeof email !== 'string' || !email.includes('@')) return '';
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}*@${domain}`;
  const prefix = user.slice(0, 2);
  const suffix = user.slice(-1);
  return `${prefix}${'*'.repeat(Math.max(2, user.length - 3))}${suffix}@${domain}`;
}

router.get('/my-certificate', myCertificate('details'));
router.get('/download/my-certificate', myCertificate('download'));
router.get('/preview/my-certificate', myCertificate('preview'));
router.get('/download/:credentialId(IN-26-.*)', myCertificate('download'));
router.get('/innovative-india/verify/:credentialId', rateLimit({ windowMs: 60000, max: 60 }),
  (req, res) => verifyCertificate(req, res, req.params.credentialId));

/**
 * GET /api/certificates/my-certificates
 * Authenticated user endpoint to view all credentials registered to their verified email.
 * Requires NO additional OTP once email verification is complete.
 */
router.get(['/my-certificates', '/me'], requireAuth, async (req, res) => {
  try {
    const userEmail = req.user.email.toLowerCase();
    const certs = (await db.getUserCertificates(userEmail) || []).filter(cert => cert.event_slug !== 'innovative-india-2026');

    return res.json({
      success: true,
      database: 'Supabase PostgreSQL',
      userEmail,
      count: (certs || []).length,
      certificates: (certs || []).map(c => ({
        credential_id: c.credential_id,
        recipient_name: c.recipient_name,
        recipient_email: c.recipient_email,
        recipient_organisation: c.recipient_organisation || 'Participant',
        event_name: 'ORCA CODERS: ORCATHON 2026',
        event_slug: c.event_slug,
        certificate_type: c.certificate_type,
        issue_date: c.issue_date,
        status: c.status,
        team_name: c.team_name || '',
        verification_url: `/certificate/verify/${c.credential_id}`,
        download_url: `/api/certificates/download/${c.credential_id}`
      }))
    });
  } catch (err) {
    console.error('[MY CERTIFICATES ERROR]:', err);
    return res.status(500).json({ error: 'Failed to retrieve your certificates.' });
  }
});

/**
 * GET /api/certificates/download/:credentialId
 * Authenticated download endpoint with ownership enforcement.
 * Users can only download their own certificates without any additional OTP.
 */
router.get('/download/:credentialId', requireAuth, async (req, res) => {
  try {
    const { credentialId } = req.params;
    if (!credentialId || !credentialId.trim()) {
      return res.status(400).json({ error: 'Valid credential ID is required.' });
    }

    const cert = await db.getIssuedCertificateById(credentialId.trim());
    if (!cert) {
      return res.status(404).json({ error: 'Certificate not found in registry.' });
    }

    if (cert.event_slug === 'orca-coders-orcathon-2026') {
      const participant = await db.findParticipantByEmail(cert.recipient_email, cert.event_slug);
      if (!participant || ![1, true].includes(participant.is_eligible)) return res.status(403).json({error:'Certificate eligibility unavailable.'});
    }
    // Ownership Enforcement: User must own the certificate or be an admin
    const certEmail = (cert.recipient_email || '').toLowerCase().trim();
    const userEmail = (req.user.email || '').toLowerCase().trim();
    if (req.user.role !== 'admin' && certEmail !== userEmail) {
      return res.status(403).json({
        error: 'Access denied: You do not have permission to download this certificate.'
      });
    }

    if (cert.event_slug === 'innovative-india-2026') return res.status(404).json({ error: 'Certificate not found.' });

    return res.json({
      success: true,
      database: 'Supabase PostgreSQL',
      message: 'Certificate access authorized without additional OTP.',
      credential: {
        credential_id: cert.credential_id,
        recipient_name: cert.recipient_name,
        recipient_email: cert.recipient_email,
        recipient_organisation: cert.recipient_organisation || 'Participant',
        event_name: 'ORCA CODERS: ORCATHON 2026',
        event_slug: cert.event_slug,
        certificate_type: cert.certificate_type,
        issue_date: cert.issue_date,
        status: cert.status,
        verification_url: `/certificate/verify/${cert.credential_id}`
      }
    });
  } catch (err) {
    console.error('[CERTIFICATE DOWNLOAD ERROR]:', err);
    return res.status(500).json({ error: 'Failed to authorize certificate download.' });
  }
});

/**
 * POST /api/certificates/claim
 * Validates participant registration against authoritative event registry and issues/retrieves credential.
 * Matches the exact email on the verified server session.
 */
router.post('/claim', requireAuth, rateLimit({ windowMs: 60000, max: 30 }), async (req, res) => {
  try {
    const eventSlug = 'orca-coders-orcathon-2026';
    if (req.body?.eventSlug && req.body.eventSlug !== eventSlug) return res.status(403).json({ error: 'Use My Certificate for Innovative India.' });
    const cleanEmail = req.user.email.trim().toLowerCase();
    if (req.body?.email && String(req.body.email).trim().toLowerCase() !== cleanEmail) {
      return res.status(403).json({ error: 'You may only claim your own certificate.' });
    }
    const approved = await db.findParticipantByEmail(cleanEmail, eventSlug);
    if (!approved || ![1, true].includes(approved.is_eligible)) return res.status(403).json({error:'Your verified email is not eligible for Orcathon.'});
    const existingCert = await db.getIssuedCertificateByEmail(cleanEmail, eventSlug);
    if (existingCert) {
      const isOwner = req.user?.emailVerified && req.user.email.toLowerCase() === (existingCert.recipient_email || '').toLowerCase();
      const safeEmail = isOwner ? existingCert.recipient_email : maskEmail(existingCert.recipient_email);
      return res.json({
        success: true,
        alreadyIssued: true,
        database: 'Supabase PostgreSQL',
        message: 'Certificate successfully verified and retrieved!',
        credential: {
          credential_id: existingCert.credential_id,
          recipient_name: existingCert.recipient_name,
          recipient_email: safeEmail,
          recipient_organisation: existingCert.recipient_organisation || 'Participant',
          event_name: 'ORCA CODERS: ORCATHON 2026',
          event_slug: existingCert.event_slug,
          certificate_type: existingCert.certificate_type,
          issue_date: existingCert.issue_date,
          status: existingCert.status,
          team_name: existingCert.team_name || '',
          verification_url: `/certificate/verify/${existingCert.credential_id}`,
          download_url: `/api/certificates/download/${existingCert.credential_id}`
        }
      });
    }

    // 2. Validate against participant database
    const participant = await db.findParticipantByEmail(cleanEmail, eventSlug);

    if (!participant) {
      return res.status(404).json({
        error: 'No eligible registration found for your account.'
      });
    }

    if (participant.is_eligible === false || participant.is_eligible === 0) {
      return res.status(403).json({
        error: 'This registration is marked as ineligible for certificate issuance.'
      });
    }

    // Determine canonical name and email
    const recipientName = participant.candidate_name;
    const recipientOrg = participant.candidate_organisation || '';
    const recipientEmail = participant.candidate_email || cleanEmail;

    // 3. Issue new credential
    const newCert = await db.issueCertificate({
      participantId: participant.id,
      recipientName,
      recipientEmail,
      recipientOrganisation: recipientOrg,
      eventSlug,
      certificateType: 'Participation',
      issueDate: 'October 25, 2026'
    });

    const isOwner = req.user?.emailVerified && req.user.email.toLowerCase() === (newCert.recipient_email || recipientEmail).toLowerCase();
    const safeNewEmail = isOwner ? (newCert.recipient_email || recipientEmail) : maskEmail(newCert.recipient_email || recipientEmail);

    return res.status(201).json({
      success: true,
      alreadyIssued: false,
      database: 'Supabase PostgreSQL',
      message: 'Certificate successfully verified and issued!',
      credential: {
        credential_id: newCert.credential_id,
        recipient_name: newCert.recipient_name,
        recipient_email: safeNewEmail,
        recipient_organisation: newCert.recipient_organisation || 'Participant',
        event_name: 'ORCA CODERS: ORCATHON 2026',
        event_slug: newCert.event_slug,
        certificate_type: newCert.certificate_type,
        issue_date: newCert.issue_date,
        status: newCert.status,
        team_name: participant.team_name || '',
        verification_url: `/certificate/verify/${newCert.credential_id}`,
        download_url: `/api/certificates/download/${newCert.credential_id}`
      }
    });
  } catch (err) {
    console.error('[CERTIFICATE CLAIM ERROR]:', err);
    return res.status(500).json({ error: 'Failed to process certificate claim. Please try again.' });
  }
});

/**
 * GET /api/certificates/verify/:credentialId
 * Public verification endpoint to authenticate any issued credential.
 * Automatically masks email to prevent harvesting attacks.
 */
router.get('/verify/:credentialId', rateLimit({ windowMs: 60000, max: 60 }), async (req, res) => {
  try {
    const { credentialId } = req.params;
    if (!credentialId || !credentialId.trim()) {
      return res.status(400).json({ error: 'Valid credential ID is required.' });
    }

    if (/^IN-26-/i.test(credentialId.trim())) return verifyCertificate(req, res, credentialId);

    const cert = await db.getIssuedCertificateById(credentialId.trim());

    if (!cert) {
      return res.status(404).json({
        error: `Credential ID "${credentialId}" was not found in the authoritative registry.`,
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
    console.error('[CERTIFICATE VERIFICATION ERROR]:', err);
    return res.status(500).json({ error: 'Verification service temporarily unavailable.' });
  }
});

/**
 * GET /api/certificates/stats
 * Public registry overview endpoint for participants and certificates count.
 */
router.get('/stats', async (req, res) => {
  try {
    const eventSlug = req.query.eventSlug || 'orca-coders-orcathon-2026';
    const [participantsCount, issuedCount] = await Promise.all([
      db.countParticipants(eventSlug),
      db.countIssuedCertificates(eventSlug)
    ]);

    return res.json({
      event: 'ORCA CODERS: ORCATHON 2026',
      event_slug: eventSlug,
      totalParticipants: participantsCount,
      total_eligible_participants: participantsCount,
      total_issued_certificates: issuedCount,
      registry_status: 'Active',
      database: 'Supabase PostgreSQL'
    });
  } catch (err) {
    console.error('[CERTIFICATES STATS ERROR]:', err);
    return res.status(500).json({ error: 'Failed to retrieve certificate registry stats.' });
  }
});

module.exports = router;
