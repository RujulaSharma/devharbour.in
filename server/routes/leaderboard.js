const express = require('express');
const router = express.Router();
const db = require('../db');
const { currentActivityStreaks } = require('../activity-streak');

router.get('/', async (req, res) => {
  const timeframe = ['Weekly', 'Monthly'].includes(req.query.timeframe) ? req.query.timeframe : 'All-time';
  const requestedLimit = Number.parseInt(req.query.limit, 10);
  const limit = Number.isFinite(requestedLimit) ? Math.min(50, Math.max(5, requestedLimit)) : 20;
  res.setHeader('Cache-Control', 'private, no-store');
  try {
    const rows = await db.getLeaderboard(timeframe, limit);
    const viewerId = req.user?.emailVerified ? req.user.id : null;
    const ids = new Set(rows.map(row => row.userId));
    if (viewerId) ids.add(viewerId);
    const streaks = currentActivityStreaks(await db.getLeaderboardActivityDays([...ids]));
    const rankings = rows.map(row => ({ ...row, streakDays: streaks.get(row.userId) || 0 }));
    const currentUserRank = rankings.find(row => row.userId === viewerId) || null;
    const currentUserStreak = viewerId ? (streaks.get(viewerId) || 0) : null;
    res.json({ timeframe, rankings, currentUserRank, currentUserStreak });
  } catch (error) {
    console.error('[LEADERBOARD]', error.code || error.name);
    res.status(503).json({ timeframe, rankings: [], currentUserRank: null, error: 'Leaderboard is temporarily unavailable.' });
  }
});

module.exports = router;
