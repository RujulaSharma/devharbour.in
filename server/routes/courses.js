const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../auth');

// GET /api/courses
router.get('/', (req, res) => {
  const category = req.query.category || 'All';
  const courses = db.getCourses(category);
  res.json({ courses });
});

// GET /api/courses/lesson/:id (Specific lesson details)
router.get('/lesson/:id', (req, res) => {
  const lesson = db.getLessonById(req.params.id);
  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found.' });
  }
  const course = db.getCourseById(lesson.course_id);
  const siblings = db.getCourseLessons(lesson.course_id);

  let userProgress = null;
  if (req.user) {
    userProgress = db.getLessonProgress(req.user.id, lesson.id);
  }

  res.json({
    lesson,
    course,
    siblings,
    progress: userProgress
  });
});

// POST /api/courses/lesson/:id/progress
router.post('/lesson/:id/progress', requireAuth, (req, res) => {
  const { readingSeconds } = req.body;
  const seconds = Math.max(0, parseInt(readingSeconds || '10', 10));
  const lesson = db.getLessonById(req.params.id);
  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found.' });
  }

  const result = db.saveLessonProgress(req.user.id, lesson.id, seconds, false);
  res.json(result);
});

// POST /api/courses/lesson/:id/complete
router.post('/lesson/:id/complete', requireAuth, (req, res) => {
  const lesson = db.getLessonById(req.params.id);
  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found.' });
  }

  const result = db.saveLessonProgress(req.user.id, lesson.id, 30, true);
  res.json({
    message: result.xp && result.xp.awarded ? 'Lesson completed! 10 XP awarded.' : 'Lesson marked as completed.',
    progress: result.progress,
    xp: result.xp
  });
});

// GET /api/courses/:id
router.get('/:id', (req, res) => {
  const course = db.getCourseById(req.params.id);
  if (!course) {
    return res.status(404).json({ error: 'Course not found.' });
  }
  const lessons = db.getCourseLessons(req.params.id);
  res.json({ course, lessons });
});

module.exports = router;
