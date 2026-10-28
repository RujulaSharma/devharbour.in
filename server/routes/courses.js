const express = require('express');
const router = require('../async-router').createRouter();
const db = require('../database');
const { requireAuth } = require('../auth');
const eventBus = require('../events');
const { courseCache } = require('../course-cache');

// GET /api/courses
router.get('/', async (req, res) => {
  const category = typeof req.query.category === 'string' && req.query.category ? req.query.category : 'All';
  const { courses, cache } = await courseCache.list(category, () => db.getCourses(category));
  res.setHeader('X-Course-Cache', cache);
  res.json({ courses });
});

// GET /api/courses/lesson/:id (Specific lesson details)
router.get('/lesson/:id', async (req, res) => {
  const lesson = await db.getLessonById(req.params.id);
  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found.' });
  }
  const course = await db.getCourseById(lesson.course_id);
  const siblings = await db.getCourseLessons(lesson.course_id);

  let userProgress = null;
  if (req.user) {
    userProgress = await db.getLessonProgress(req.user.id, lesson.id);
  }

  res.json({
    lesson,
    course,
    siblings,
    progress: userProgress
  });
});

// POST /api/courses/lesson/:id/progress
router.post('/lesson/:id/progress', requireAuth, async (req, res) => {
  const { readingSeconds } = req.body;
  const seconds = Math.max(0, parseInt(readingSeconds || '10', 10));
  const lesson = await db.getLessonById(req.params.id);
  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found.' });
  }

  const result = await db.saveLessonProgress(req.user.id, lesson.id, seconds, false);
  res.json(result);
});

// POST /api/courses/lesson/:id/complete
router.post('/lesson/:id/complete', requireAuth, async (req, res) => {
  const lesson = await db.getLessonById(req.params.id);
  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found.' });
  }

  const result = await db.saveLessonProgress(req.user.id, lesson.id, 30, true);

  if (result.xp && result.xp.awarded) {
    eventBus.broadcast({
      type: 'lesson_completed',
      username: req.user.username,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      xpEarned: result.xp.awarded,
      message: `${req.user.username} completed reading "${lesson.title}" (+${result.xp.awarded} XP)`
    });
  }
  res.json({
    message: result.xp && result.xp.awarded ? 'Lesson completed! 10 XP awarded.' : 'Lesson marked as completed.',
    progress: result.progress,
    xp: result.xp
  });
});

// GET /api/courses/:id
router.get('/:id', async (req, res) => {
  const course = await db.getCourseById(req.params.id);
  if (!course) {
    return res.status(404).json({ error: 'Course not found.' });
  }
  const lessons = await db.getCourseLessons(req.params.id);
  res.json({ course, lessons });
});

module.exports = router;
