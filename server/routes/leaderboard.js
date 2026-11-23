const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const timeframe = ['Weekly', 'Monthly'].includes(req.query.timeframe) ? req.query.timeframe : 'All-time';
  const requestedLimit = Number.parseInt(req.query.limit, 10);
  const limit = Number.isFinite(requestedLimit) ? Math.min(50, Math.max(5, requestedLimit)) : 20;
  res.setHeader('Cache-Control', 'private, no-store');
  try {
    const rankings = await db.getLeaderboard(timeframe, limit);
    const currentUserRank = rankings.find(row => row.userId === req.user?.id) || null;
    res.json({ timeframe, rankings, currentUserRank });
  } catch (error) {
    console.error('[LEADERBOARD]', error.code || error.name);
    res.status(503).json({ timeframe, rankings: [], currentUserRank: null, error: 'Leaderboard is temporarily unavailable.' });
  }
});

module.exports = router;
