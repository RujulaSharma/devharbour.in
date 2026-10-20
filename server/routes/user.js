const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../auth');

// GET /api/user/settings
router.get('/settings', requireAuth, (req, res) => {
  const settings = db.getUserSettings(req.user.id);
  res.json({ settings });
});

// POST /api/user/settings
router.post('/settings', requireAuth, (req, res) => {
  const { theme, emailNotifications, profilePublic } = req.body;
  const updated = db.saveUserSettings(req.user.id, { theme, emailNotifications, profilePublic });
  res.json({ settings: updated, message: 'Settings saved.' });
});

// GET /api/user/summary
router.get('/summary', requireAuth, (req, res) => {
  const userId = req.user.id;
  const totalXp = req.user.totalXp;
  const level = req.user.level;
  const streak = req.user.streak_days;

  const completedLessons = db.db.prepare("SELECT COUNT(*) as count FROM lesson_progress WHERE user_id = ? AND status = 'completed'").get(userId).count;
  const solvedChallenges = db.db.prepare("SELECT COUNT(DISTINCT challenge_id) as count FROM submissions WHERE user_id = ? AND status = 'passed'").get(userId).count;
  const submittedProjects = db.db.prepare('SELECT COUNT(*) as count FROM projects WHERE user_id = ?').get(userId).count;
  const xpHistory = db.getXpHistory(userId, 10);
  const achievements = db.getUserAchievements(userId);

  res.json({
    profile: {
      id: req.user.id,
      username: req.user.username,
      fullName: req.user.full_name,
      avatarUrl: req.user.avatar_url,
      role: req.user.role,
      bio: req.user.bio,
      githubUrl: req.user.github_url,
      portfolioUrl: req.user.portfolio_url
    },
    stats: {
      totalXp,
      level,
      streakDays: streak,
      completedLessons,
      solvedChallenges,
      submittedProjects,
      achievementsCount: achievements.length
    },
    xpHistory,
    achievements
  });
});

// GET /api/user/profile/:username (Public profile view)
router.get('/profile/:username', (req, res) => {
  const user = db.getUserByUsername(req.params.username);
  if (!user) {
    return res.status(404).json({ error: 'Developer profile not found.' });
  }

  const settings = db.getUserSettings(user.id);
  if (!settings.profile_public && (!req.user || req.user.id !== user.id)) {
    return res.status(403).json({ error: 'This profile is private.' });
  }

  const totalXp = db.getUserTotalXp(user.id);
  const solvedChallenges = db.db.prepare("SELECT COUNT(DISTINCT challenge_id) as count FROM submissions WHERE user_id = ? AND status = 'passed'").get(user.id).count;
  const projects = db.db.prepare('SELECT id, title, description, category, tech_stack_json, repo_url, demo_url, votes_count FROM projects WHERE user_id = ? AND status = "approved"').all(user.id).map(p => ({
    ...p,
    techStack: JSON.parse(p.tech_stack_json || '[]')
  }));
  const achievements = db.getUserAchievements(user.id);

  res.json({
    user: {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      githubUrl: user.github_url,
      portfolioUrl: user.portfolio_url,
      streakDays: user.streak_days,
      totalXp,
      level: db.calculateLevel(totalXp)
    },
    stats: {
      solvedChallenges,
      projectsCount: projects.length,
      achievementsCount: achievements.length
    },
    projects,
    achievements
  });
});

module.exports = router;
