/**
 * Dev Harbour - Authentication & Authorization Middleware
 */

const crypto = require('node:crypto');
const db = require('./db');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, expectedHash) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && re.test(email.trim());
}

function validateUsername(username) {
  const re = /^[a-zA-Z0-9_-]{3,30}$/;
  return typeof username === 'string' && re.test(username.trim());
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8;
}

// Strip credentials and sensitive internal fields before returning user data
function sanitizeUser(user, extras = {}) {
  if (!user) return null;
  const { password_hash, salt, code_hash, certificate_name, ...safe } = user;
  return {
    ...safe,
    ...extras
  };
}

const SESSION_COOKIE = 'dh_session';
const { PUBLIC_ORIGINS, publicSiteRequest } = require('./site-origin');

function canUseSessionCookie(req) {
  const fetchSite = req.headers['sec-fetch-site'];
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') return false;
  const origin = req.headers.origin;
  if (!origin) return true;
  const appOrigin = process.env.APP_BASE_URL?.replace(/\/$/, '');
  if (PUBLIC_ORIGINS.has(origin)) return true;
  return origin === appOrigin || origin === req.protocol + '://' + req.get?.('host');
}

function setSessionCookie(req, res, token, expiresAt) {
  if (!canUseSessionCookie(req)) return;
  res.setHeader('Cache-Control', 'private, no-store');
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production' || req.secure || publicSiteRequest(req),
    sameSite: 'strict', expires: new Date(expiresAt), path: '/api',
    ...(publicSiteRequest(req) ? { domain: 'devharbour.in' } : {})
  });
}

function clearSessionCookie(req, res) {
  if (!canUseSessionCookie(req)) return;
  const options = {
    httpOnly: true, secure: process.env.NODE_ENV === 'production' || req.secure || publicSiteRequest(req),
    sameSite: 'strict', path: '/api'
  };
  res.setHeader('Cache-Control', 'private, no-store');
  res.clearCookie(SESSION_COOKIE, options);
  if (publicSiteRequest(req)) res.clearCookie(SESSION_COOKIE, { ...options, domain: 'devharbour.in' });
}

function getAuthToken(req) {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) return authHeader.slice(7);
  if (typeof req.headers['x-auth-token'] === 'string') return req.headers['x-auth-token'];
  if (!canUseSessionCookie(req)) return null;
  const cookie = req.headers.cookie?.split(';').find(value => value.trimStart().startsWith(SESSION_COOKIE + '='));
  const token = cookie?.trim().slice(SESSION_COOKIE.length + 1);
  return /^[0-9a-f]{64}$/.test(token || '') ? token : null;
}

// Authentication Middleware: populates req.user if valid token provided
async function authMiddleware(req, res, next) {
  const token = getAuthToken(req);
  if (token) {
    try {
      const session = await db.getSession(token);
      if (session) {
        const user = await db.getUserById(session.user_id);
        if (user) {
          const totalXp = await db.getUserTotalXp(user.id);
          const isVerified = await db.isEmailVerified(user.id);
          req.user = sanitizeUser(user, {
            emailVerified: isVerified,
            totalXp: totalXp || 0,
            level: db.calculateLevel(totalXp || 0)
          });
          req.token = token;
          req.authExpiresAt = session.expires_at;
        }
      }
    } catch (err) {
      req.authUnavailable = true;
      console.error('authMiddleware error:', err.code || err.name);
    }
  }

  next();
}

// Strict requirement for authenticated endpoints
function requireAuth(req, res, next) {
  if (req.authUnavailable) return res.status(503).json({ error: 'Session check temporarily unavailable.' });
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  if (req.user.emailVerified === false) {
    return res.status(403).json({
      error: 'Email address not verified. Please verify your email before accessing this feature.',
      requiresVerification: true,
      email: req.user.email
    });
  }
  next();
}

// Role-based authorization
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions.' });
    }
    next();
  };
}

module.exports = {
  hashPassword,
  verifyPassword,
  validateEmail,
  validateUsername,
  validatePassword,
  sanitizeUser,
  getAuthToken,
  setSessionCookie,
  clearSessionCookie,
  authMiddleware,
  requireAuth,
  requireRole
};
