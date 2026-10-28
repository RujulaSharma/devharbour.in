const express = require('express');
const router = require('../async-router').createRouter();
const db = require('../database');
const { requireAuth } = require('../auth');

// GET /api/achievements (Catalog of all platform achievements)
router.get('/', async (req, res) => {
  const achievements = await db.getAchievements();
  let userUnlocked = [];
  if (req.user) {
    userUnlocked = (await db.getUserAchievements(req.user.id)).map(a => a.id);
  }
  res.json({
    achievements: achievements.map(a => ({
      ...a,
      unlocked: userUnlocked.includes(a.id)
    }))
  });
});

// GET /api/achievements/user (Current user's unlocked badges)
router.get('/user', requireAuth, async (req, res) => {
  const achievements = await db.getUserAchievements(req.user.id);
  res.json({ achievements });
});

module.exports = router;
