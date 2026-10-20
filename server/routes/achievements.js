const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../auth');

// GET /api/achievements (Catalog of all platform achievements)
router.get('/', (req, res) => {
  const achievements = db.db.prepare('SELECT * FROM achievements ORDER BY xp_bonus ASC').all();
  let userUnlocked = [];
  if (req.user) {
    userUnlocked = db.getUserAchievements(req.user.id).map(a => a.id);
  }
  res.json({
    achievements: achievements.map(a => ({
      ...a,
      unlocked: userUnlocked.includes(a.id)
    }))
  });
});

// GET /api/achievements/user (Current user's unlocked badges)
router.get('/user', requireAuth, (req, res) => {
  const achievements = db.getUserAchievements(req.user.id);
  res.json({ achievements });
});

module.exports = router;
