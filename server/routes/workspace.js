const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../auth');
const { rateLimit } = require('../rate-limiter');
const { indiaDay, startFocus, canClaimFocus } = require('../study-rewards');

router.post('/focus/start', requireAuth, rateLimit({ max: 12 }), (req, res) => {
  const token = startFocus(req.user.id, req.body?.minutes, process.env.EMAIL_VERIFICATION_SECRET);
  if (!token) return res.status(400).json({ error: 'Start a 25, 50, or 60 minute focus session to earn XP.' });
  res.setHeader('Cache-Control', 'private, no-store');
  return res.json({ token });
});

router.post('/focus/complete', requireAuth, rateLimit({ max: 12 }), async (req, res) => {
  const completedAt = canClaimFocus(req.body?.token, req.user.id, process.env.EMAIL_VERIFICATION_SECRET);
  if (!completedAt) {
    return res.status(400).json({ error: 'Complete a signed-in focus session before claiming XP.' });
  }
  try {
    const reward = await db.awardXp(req.user.id, 15, 'streak_bonus', 'focus:' + indiaDay(completedAt), 'Completed a study timer session');
    return res.json({ reward });
  } catch {
    return res.status(503).json({ error: 'Study XP is temporarily unavailable.' });
  }
});

async function assignmentReward(userId, assignment) {
  if (assignment.status !== 'completed') return null;
  try {
    const day = indiaDay(Date.now());
    return await db.awardXp(userId, 10, 'streak_bonus', 'assignment:' + day, 'Completed a Workspace assignment');
  } catch (error) {
    console.error('[ASSIGNMENT XP]', error.code || error.name);
    return null;
  }
}

function isValidHttpUrl(string) {
  if (!string || typeof string !== 'string') return false;
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// GET /api/workspace — Retrieve all workspace items for user
router.get('/', async (req, res) => {
  try {
    if (!req.user) {
      return res.json({
        tasks: [],
        notes: [],
        assignments: [],
        snippets: [],
        bookmarks: []
      });
    }
    const data = await db.getWorkspaceData(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve workspace data.' });
  }
});

// Tasks
router.post('/tasks', requireAuth, async (req, res) => {
  try {
    const { title, subject, priority } = req.body;
    const dueDate = req.body.dueDate || req.body.due_date;
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required.' });
    }
    const task = await db.createWorkspaceTask(req.user.id, { title, subject, priority, dueDate });
    res.status(201).json({ ...task, task });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task.' });
  }
});

router.put('/tasks/:id', requireAuth, async (req, res) => {
  try {
    const task = await db.updateWorkspaceTask(req.user.id, req.params.id, req.body);
    if (!task) {
      return res.status(404).json({ error: 'Task not found or unauthorized.' });
    }
    res.json({ ...task, task });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task.' });
  }
});

router.delete('/tasks/:id', requireAuth, async (req, res) => {
  try {
    const deleted = await db.deleteWorkspaceTask(req.user.id, req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Task not found or unauthorized.' });
    }
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task.' });
  }
});

// Notes
router.post('/notes', requireAuth, async (req, res) => {
  try {
    const { title, content, subject, tags } = req.body;
    const link = req.body.link || req.body.link_url;
    const isPinned = req.body.isPinned !== undefined ? req.body.isPinned : req.body.is_pinned;
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Note title is required.' });
    }
    const note = await db.createWorkspaceNote(req.user.id, { title, content, subject, tags, link, isPinned });
    res.status(201).json({ ...note, note });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create note.' });
  }
});

router.put('/notes/:id', requireAuth, async (req, res) => {
  try {
    const note = await db.updateWorkspaceNote(req.user.id, req.params.id, req.body);
    if (!note) {
      return res.status(404).json({ error: 'Note not found or unauthorized.' });
    }
    res.json({ ...note, note });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update note.' });
  }
});

router.delete('/notes/:id', requireAuth, async (req, res) => {
  try {
    const deleted = await db.deleteWorkspaceNote(req.user.id, req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Note not found or unauthorized.' });
    }
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete note.' });
  }
});

// Assignments
router.post('/assignments', requireAuth, async (req, res) => {
  try {
    const { title, description, priority, status } = req.body;
    const dueDate = req.body.dueDate || req.body.deadline;
    const link = req.body.link || req.body.link_url;
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Assignment title is required.' });
    }
    const assignment = await db.createWorkspaceAssignment(req.user.id, { title, description, dueDate, priority, status, link });
    const reward = await assignmentReward(req.user.id, assignment);
    res.status(201).json({ ...assignment, assignment, reward });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create assignment.' });
  }
});

router.put('/assignments/:id', requireAuth, async (req, res) => {
  try {
    const assignment = await db.updateWorkspaceAssignment(req.user.id, req.params.id, req.body);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found or unauthorized.' });
    }
    const reward = req.body.status === 'completed' ? await assignmentReward(req.user.id, assignment) : null;
    res.json({ ...assignment, assignment, reward });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update assignment.' });
  }
});

router.delete('/assignments/:id', requireAuth, async (req, res) => {
  try {
    const deleted = await db.deleteWorkspaceAssignment(req.user.id, req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Assignment not found or unauthorized.' });
    }
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete assignment.' });
  }
});

// Code Snippets
router.post('/snippets', requireAuth, async (req, res) => {
  try {
    const name = req.body.name || req.body.title;
    const language = req.body.language;
    const code = req.body.code;
    const input = req.body.input !== undefined ? req.body.input : req.body.input_data;
    if (!name || typeof name !== 'string' || !name.trim() || name.trim().length > 100) {
      return res.status(400).json({ error: 'Valid snippet name is required (maximum 100 characters).' });
    }
    if (!code || typeof code !== 'string' || code.length > 100000) {
      return res.status(400).json({ error: 'Code content is required (maximum 100KB).' });
    }
    const snippet = await db.saveWorkspaceSnippet(req.user.id, { name: name.trim(), language: String(language || 'javascript').slice(0, 30), code, input });
    res.status(201).json({ ...snippet, snippet });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save code snippet.' });
  }
});

router.delete('/snippets/:id', requireAuth, async (req, res) => {
  try {
    const deleted = await db.deleteWorkspaceSnippet(req.user.id, req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Snippet not found or unauthorized.' });
    }
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete snippet.' });
  }
});

// Bookmarks
router.post('/bookmarks', requireAuth, async (req, res) => {
  try {
    const { itemId, itemType, title, category } = req.body;
    const url = req.body.url || req.body.target_url;
    if (!title || typeof title !== 'string' || !title.trim() || title.trim().length > 150) {
      return res.status(400).json({ error: 'Title is required (maximum 150 characters).' });
    }
    const internalView = typeof url === 'string' && /^#v-[a-z][a-z0-9-]*$/.test(url);
    if (!internalView && !isValidHttpUrl(url)) {
      return res.status(400).json({ error: 'A valid HTTP/HTTPS URL is required.' });
    }
    const bookmark = await db.addWorkspaceBookmark(req.user.id, {
      itemId: itemId ? String(itemId).slice(0, 50) : undefined,
      itemType: itemType ? String(itemType).slice(0, 30) : undefined,
      title: title.trim(),
      url: url.trim(),
      category: category ? String(category).slice(0, 50) : undefined
    });
    res.status(201).json({ ...bookmark, bookmark });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save bookmark.' });
  }
});

router.delete('/bookmarks/:id', requireAuth, async (req, res) => {
  try {
    const deleted = await db.deleteWorkspaceBookmark(req.user.id, req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Bookmark not found or unauthorized.' });
    }
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete bookmark.' });
  }
});

module.exports = router;
