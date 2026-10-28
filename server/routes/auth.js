const express = require('express');
const router = require('../async-router').createRouter();
const db = require('../database');
const { hashPassword, verifyPassword, validateEmail, validateUsername, validatePassword, requireAuth } = require('../auth');
const eventBus = require('../events');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, username, fullName, password, location, bio } = req.body;

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Valid email address is required.' });
  }
  if (!validateUsername(username)) {
    return res.status(400).json({ error: 'Username must be 3-30 characters (letters, numbers, underscores, hyphens).' });
  }
  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    return res.status(400).json({ error: 'Full name is required (minimum 2 characters).' });
  }
  if (!validatePassword(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  // Check unique constraints
  if (await db.getUserByEmail(email)) {
    return res.status(409).json({ error: 'An account with this email address already exists.' });
  }
  if (await db.getUserByUsername(username)) {
    return res.status(409).json({ error: 'This username is already taken. Please choose another.' });
  }

  const { salt, hash } = hashPassword(password);
  const user = await db.createUser({
    email,
    username,
    fullName,
    passwordHash: hash,
    salt,
    role: 'student',
    location: location || '',
    bio: bio || ''
  });

  const { token, expiresAt } = await db.createSession(user.id);

  // Broadcast real-time user signup
  eventBus.broadcast({
    type: 'user_joined',
    username: user.username,
    location: user.location || '',
    message: `${user.username}${user.location ? ` from ${user.location}` : ''} joined the Dev Harbour student community!`
  });

  res.status(201).json({
    message: 'Account successfully registered.',
    token,
    expiresAt,
    user: {
      ...user,
      totalXp: 0,
      level: 1
    }
  });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { login, password } = req.body; // login can be email or username

  if (!login || !password) {
    return res.status(400).json({ error: 'Email/Username and password are required.' });
  }

  const isEmail = login.includes('@');
  const user = isEmail ? await db.getUserByEmail(login) : await db.getUserByUsername(login);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. Please verify your email/username and password.' });
  }

  const valid = verifyPassword(password, user.salt, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials. Please verify your email/username and password.' });
  }

  const { token, expiresAt } = await db.createSession(user.id);
  const totalXp = await db.getUserTotalXp(user.id);
  const streak = await db.updateStreak(user.id);

  res.json({
    message: 'Welcome back to Dev Harbour!',
    token,
    expiresAt,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.full_name,
      role: user.role,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      location: user.location || '',
      githubUrl: user.github_url,
      portfolioUrl: user.portfolio_url,
      streakDays: streak,
      totalXp,
      level: db.calculateLevel(totalXp)
    }
  });
});

// POST /api/auth/logout
router.post('/logout', requireAuth, async (req, res) => {
  if (req.token) {
    await db.deleteSession(req.token);
  }
  res.json({ message: 'Successfully signed out.' });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  const user = req.user;
  const settings = await db.getUserSettings(user.id);
  const interactions = await db.getUserInteractions(user.id);
  const achievements = await db.getUserAchievements(user.id);

  res.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.full_name,
      role: user.role,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      location: user.location || '',
      githubUrl: user.github_url,
      portfolioUrl: user.portfolio_url,
      streakDays: user.streak_days,
      totalXp: user.totalXp,
      level: user.level,
      settings,
      interactions,
      achievementsCount: achievements.length
    }
  });
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, async (req, res) => {
  const { fullName, bio, githubUrl, portfolioUrl, location, avatarUrl } = req.body;
  const updated = await db.updateUserProfile(req.user.id, {
    fullName,
    bio,
    githubUrl,
    portfolioUrl,
    location,
    avatarUrl
  });

  res.json({
    message: 'Profile updated successfully.',
    user: {
      ...updated,
      totalXp: req.user.totalXp,
      level: req.user.level
    }
  });
});

module.exports = router;
