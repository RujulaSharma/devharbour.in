const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../auth');

// GET /api/user/settings
router.get('/settings', requireAuth, async (req, res) => {
  try {
    const settings = await db.getUserSettings(req.user.id);
    if (process.env.PROFILE_ECOSYSTEM_ENABLED === 'true' && settings) {
      const profile = await require('../profile/store').getProfile(req.user.id);
      settings.profile_public = profile.visibility === 'public' ? 1 : 0;
    }
    res.json({ settings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve user settings.' });
  }
});

// POST /api/user/settings
router.post('/settings', requireAuth, (req,res,next) => process.env.PROFILE_ECOSYSTEM_ENABLED === 'true' ? require('../profile/policy').csrf(req,res,next) : next(), async (req, res) => {
  try {
    const { theme, emailNotifications, profilePublic } = req.body;
    const allowedThemes = ['light', 'dark', 'mercury'];
    const safeTheme = (theme && allowedThemes.includes(theme)) ? theme : 'light';
    const safeEmailNotif = emailNotifications === false || emailNotifications === 0 || emailNotifications === '0' ? 0 : 1;
    let safeProfilePub = profilePublic === false || profilePublic === 0 || profilePublic === '0' ? 0 : 1;
    if (process.env.PROFILE_ECOSYSTEM_ENABLED === 'true') {
      const store = require('../profile/store');
      const profile = await store.getProfile(req.user.id);
      if (profilePublic !== undefined) {
        await store.save(req.user.id, {version:profile.version,visibility:safeProfilePub?'public':'private'});
      } else {
        safeProfilePub = profile.visibility === 'public' ? 1 : 0;
      }
    }

    const updated = await db.saveUserSettings(req.user.id, {
      theme: safeTheme,
      emailNotifications: safeEmailNotif,
      profilePublic: safeProfilePub
    });
    res.json({ settings: updated, message: 'Settings saved.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user settings.' });
  }
});

// GET /api/user/summary
router.get('/summary', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const totalXp = req.user.totalXp;
    const level = req.user.level;
    const streak = req.user.streak_days;

    const summaryStats = await db.getUserSummaryStats(userId);
    const xpHistory = await db.getXpHistory(userId, 10);
    const achievements = await db.getUserAchievements(userId);

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
        completedLessons: summaryStats.completedLessons,
        solvedChallenges: summaryStats.solvedChallenges,
        submittedProjects: summaryStats.submittedProjects,
        achievementsCount: (achievements || []).length
      },
      xpHistory: xpHistory || [],
      achievements: achievements || []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve profile summary.' });
  }
});

// GET /api/user/profile/:username (Public profile view)
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await db.getUserByUsername(req.params.username);
    if (!user) {
      return res.status(404).json({ error: 'Developer profile not found.' });
    }

    if (process.env.PROFILE_ECOSYSTEM_ENABLED === 'true') {
      // The legacy public endpoint must not bypass the new per-section privacy policy.
      const result = await require('../profile/store').publicData(user, req.user);
      return res.json({user:{...result.user,...(result.sections.about?{bio:result.bio}:{}),...(result.sections.links?{githubUrl:result.links.github||'',portfolioUrl:result.links.portfolio||''}:{})},stats:{},projects:[],achievements:[]});
    }

    const settings = await db.getUserSettings(user.id);
    if (settings && !settings.profile_public && (!req.user || req.user.id !== user.id)) {
      return res.status(403).json({ error: 'This profile is private.' });
    }

    const totalXp = await db.getUserTotalXp(user.id);
    const summaryStats = await db.getUserSummaryStats(user.id);
    const projects = await db.getUserProjects(user.id, 'approved');
    const achievements = await db.getUserAchievements(user.id);

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
        totalXp: totalXp || 0,
        level: db.calculateLevel(totalXp || 0)
      },
      stats: {
        solvedChallenges: summaryStats.solvedChallenges,
        projectsCount: (projects || []).length,
        achievementsCount: (achievements || []).length
      },
      projects: projects || [],
      achievements: achievements || []
    });
  } catch (err) {
    res.status(err.status === 404 ? 404 : 500).json({ error: err.status === 404 ? 'Developer profile not found.' : 'Failed to load user profile.' });
  }
});

module.exports = router;
