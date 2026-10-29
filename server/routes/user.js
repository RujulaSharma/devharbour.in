const express = require('express');
const router = require('../async-router').createRouter();
const db = require('../database');
const { requireAuth } = require('../auth');
router.get('/dashboard',requireAuth,async(req,res)=>res.json(await require('../dashboard').details(req.user.id)));

router.get('/learning', requireAuth, async (req,res)=>{
  res.set('Cache-Control','no-store');
  res.json(await require('../learning').overview(req.user.id));
});
router.post('/learning/:id/save', requireAuth, async (req,res)=>{
  const course=await db.getCourseById(req.params.id);
  if(!course)return res.status(404).json({error:'Course not found.'});
  // A stable internal bookmark avoids trusting a client-supplied title or URL.
  await db.addWorkspaceBookmark(req.user.id,{itemId:course.id,itemType:'course',title:course.title,
    url:'https://devharbour.in/courses?course='+encodeURIComponent(course.id),category:course.category});
  res.json({saved:true});
});
router.delete('/learning/:id/save', requireAuth, async (req,res)=>{
  const workspace=await db.getWorkspaceData(req.user.id);
  const bookmark=workspace.bookmarks.find(row=>row.item_type==='course'&&row.item_id===req.params.id);
  if(bookmark)await db.deleteWorkspaceBookmark(req.user.id,bookmark.id);
  res.json({saved:false});
});

// GET /api/user/settings
router.get('/settings', requireAuth, async (req, res) => {
  const settings = await db.getUserSettings(req.user.id);
  res.json({ settings });
});

// POST /api/user/settings
router.post('/settings', requireAuth, async (req, res) => {
  const { theme, emailNotifications, profilePublic } = req.body;
  if ((theme !== undefined && !['light', 'dark', 'mercury'].includes(theme)) ||
      [emailNotifications, profilePublic].some(value => value !== undefined && typeof value !== 'boolean'))
    return res.status(400).json({ error: 'Invalid account preferences.' });
  const current = await db.getUserSettings(req.user.id);
  const updated = await db.saveUserSettings(req.user.id, {
    theme: theme ?? current.theme,
    emailNotifications: emailNotifications ?? !!current.email_notifications,
    profilePublic: profilePublic ?? !!current.profile_public,
  });
  res.json({ settings: updated, message: 'Settings saved.' });
});

// GET /api/user/summary
router.get('/summary', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const totalXp = req.user.totalXp;
  const level = req.user.level;
  const streak = req.user.streak_days;

  const { completedLessons, solvedChallenges, submittedProjects } = await db.getUserSummaryCounts(userId);
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
router.get('/profile/:username', async (req, res) => {
  const user = await db.getUserByUsername(req.params.username);
  if (!user) {
    return res.status(404).json({ error: 'Developer profile not found.' });
  }

  const settings = await db.getUserSettings(user.id);
  if (!settings.profile_public && (!req.user || req.user.id !== user.id)) {
    return res.status(403).json({ error: 'This profile is private.' });
  }

  const totalXp = await db.getUserTotalXp(user.id);
  const { solvedChallenges } = await db.getUserSummaryCounts(user.id);
  const projects = await db.getUserPublicProjects(user.id);
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
