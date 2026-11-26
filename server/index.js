/**
 * Dev Harbour — Full-Stack Application Server
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('node:path');
const fs = require('node:fs');
const { authMiddleware } = require('./auth');

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const challengeRoutes = require('./routes/challenges');
const projectRoutes = require('./routes/projects');
const leaderboardRoutes = require('./routes/leaderboard');
const achievementRoutes = require('./routes/achievements');
const userRoutes = require('./routes/user');
const workspaceRoutes = require('./routes/workspace');
const certificateRoutes = require('./routes/certificates');
const eventBus = require('./events');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust the first reverse proxy (Render, Vercel, Cloudflare) for accurate client IP resolution & rate limiting
if (process.env.NODE_ENV === 'production' || process.env.TRUST_PROXY === '1' || process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

// Hardened Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Security & Parsing Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/user', userRoutes);
app.use('/api/profile', require('./routes/profile'));
app.use('/api/workspace', workspaceRoutes);
app.use('/api/study', require('./routes/study'));
app.use('/api/certificates', certificateRoutes);

// Real-Time Server-Sent Events (SSE) Stream
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  if (res.flushHeaders) res.flushHeaders();

  eventBus.addClient(res);

  // Send initial connection handshake and recent activity stream
  res.write(`data: ${JSON.stringify({ type: 'connected', recent: eventBus.getRecent(), timestamp: new Date().toISOString() })}\n\n`);
});

// GET /api/activity (Recent real-time events feed)
app.get('/api/activity', (req, res) => {
  res.json({
    activity: eventBus.getRecent(),
    timestamp: new Date().toISOString()
  });
});

// Platform Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'Dev Harbour',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve Frontend Static Assets
const publicDir = path.join(__dirname, '..', 'public');
app.get('/auth_helper.html', (_req, res) => res.sendStatus(404));
app.use(express.static(publicDir));

// Public config endpoint — exposes only non-secret environment values needed by the browser
app.get('/api/config/public', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || null,
    appBaseUrl: process.env.APP_BASE_URL || null
  });
});

app.use('/api/innovative-certificate', require('./routes/innovative-certificate'));
app.use('/api/orcathon-certificate', require('./routes/orcathon-certificate'));

// SPA Fallback
app.get('/u/:username', async (req, res) => {
  const indexPath = path.join(publicDir, 'index.html');
  if (process.env.PROFILE_ECOSYSTEM_ENABLED === 'false') {
    return res.status(404).send('Profile not found');
  }
  try {
    let html = fs.readFileSync(indexPath, 'utf8');
    const { esc, origin } = require('./profile/exports');
    const db = require('./db');
    const store = require('./profile/store');
    const user = await db.getUserByUsername(req.params.username);
    if (user) {
      try {
        const state = await store.access(user, null);
        if (state.read && state.profile.visibility === 'public') {
          const title = `${esc(user.full_name)} (@${esc(user.username)}) | Dev Harbour`;
          const desc = esc((state.profile.headline || (state.sections.about ? user.bio : '') || 'Developer portfolio on Dev Harbour').slice(0, 180));
          const url = `${origin()}/u/${encodeURIComponent(user.username)}`;
          const ogMeta = `<title>${title}</title><meta name="description" content="${desc}"><meta property="og:title" content="${title}"><meta property="og:description" content="${desc}"><meta property="og:url" content="${esc(url)}"><meta property="og:type" content="profile"><meta property="og:image" content="${esc(origin())}/assets/devharbour-logo.png">`;
          html = html.replace(/<title>[\s\S]*?<\/title>/i, ogMeta);
          return res.set('Cache-Control', 'private, no-store').type('html').send(html);
        }
      } catch {}
    }
    html = html.replace(/<title>[\s\S]*?<\/title>/i, '<title>Developer Profile | Dev Harbour</title><meta name="robots" content="noindex">');
    return res.set('Cache-Control', 'private, no-store').type('html').send(html);
  } catch {
    return res.sendFile(indexPath);
  }
});
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Central Error Handler — Sanitizes error responses to prevent leaking sensitive internals or credentials
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]:', err.message || err);
  const status = err.status || 500;
  // Always sanitize 500 internal errors so connection strings, database errors, or stack traces never leak
  if (status >= 500 || process.env.NODE_ENV === 'production') {
    return res.status(status).json({
      error: 'An internal error occurred. Please try again later.'
    });
  }
  res.status(status).json({
    error: err.message || 'An unexpected server error occurred.'
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`⚓ Dev Harbour full-stack server running live at http://localhost:${PORT}`);
  });
}

module.exports = app;
