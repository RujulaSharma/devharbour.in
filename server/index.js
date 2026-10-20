/**
 * Dev Harbour — Full-Stack Application Server
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('node:path');
const { authMiddleware } = require('./auth');

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const challengeRoutes = require('./routes/challenges');
const projectRoutes = require('./routes/projects');
const leaderboardRoutes = require('./routes/leaderboard');
const achievementRoutes = require('./routes/achievements');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 3000;

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
app.use(express.static(publicDir));

// SPA Fallback
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected server error occurred.'
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`⚓ Dev Harbour full-stack server running live at http://localhost:${PORT}`);
  });
}

module.exports = app;
