/**
 * Dev Harbour — Full-Stack Application Server
 */

require('dotenv').config();
const express = require('express');
const {configureSecurity,validateRequest}=require('./security');
const path = require('node:path');
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
const database = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Parsing Middlewares
configureSecurity(app);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(validateRequest);
app.use(authMiddleware);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/email-verification', require('./routes/email-verification'));
app.use('/api/courses', courseRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/user', userRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/certificates', certificateRoutes);

// Real-Time Server-Sent Events (SSE) Stream
const streamCounts=new Map();
app.get('/api/events', (req, res) => {
  if((streamCounts.get(req.ip)||0)>=20 || eventBus.clients.size>=200)return res.status(429).json({error:'Too many event streams.'});
  streamCounts.set(req.ip,(streamCounts.get(req.ip)||0)+1);
  res.on('close',()=>{const count=(streamCounts.get(req.ip)||1)-1;if(count)streamCounts.set(req.ip,count);else streamCounts.delete(req.ip);});
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
app.get('/api/health', require('./async-router').asyncHandler(async (req, res) => {
  await database.ready();
  res.json({
    status: 'healthy',
    platform: 'Dev Harbour',
    version: '1.0.0',
    database: database.provider,
    timestamp: new Date().toISOString()
  });
}));

// Serve Frontend Static Assets
const publicDir = path.join(__dirname, '..', 'public');
const publicPages = require('../scripts/public-pages').pages;
app.get(Object.keys(publicPages).map(slug => '/' + slug), (req, res) => {
  const slug = req.path.replace(/^\//, '').replace(/\/$/, '');
  res.sendFile(path.join(publicDir, 'site-pages', slug + '.html'));
});
app.use(express.static(publicDir));

// SPA Fallback
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  const route = req.path.replace(/\/$/, '') || '/';
  if (['/','/dashboard','/courses','/practice','/timer','/workspace','/projects','/roadmaps','/hackathons','/community','/settings','/certificate'].includes(route) || /^\/(?:certificate\/verify|verify)\/[^/]+$/.test(route)) {
    return res.sendFile(path.join(publicDir, 'index.html'));
  }
  res.status(404).sendFile(path.join(publicDir, '404.html'));
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]:', err.code || 'REQUEST_FAILED');
  const status = err.code === 'P2002' ? 409 : (Number.isInteger(err.status)&&err.status>=400&&err.status<600 ? err.status : 500);
  res.status(status).json({
    error: status === 409 ? 'This record already exists.' : status >= 500 ? 'An unexpected server error occurred.' : 'Invalid request.'
  });
});

if (require.main === module) {
  database.ready().then(() => {
    const server = app.listen(PORT, () => {
      console.log(`⚓ Dev Harbour full-stack server running live at http://localhost:${PORT} (${database.provider})`);
    });
    const shutdown = () => {
      require('./redis').redis.close();
      server.close(async () => { await database.close(); process.exit(0); });
      server.closeIdleConnections();
      setTimeout(() => process.exit(0), 5000).unref();
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }).catch(() => {
    console.error('Database connection failed. Check local environment settings; no SQLite fallback was used.');
    process.exitCode = 1;
  });
}

module.exports = app;
