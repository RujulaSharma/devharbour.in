const express = require('express');
const router = require('../async-router').createRouter();
const db = require('../database');
const { requireAuth } = require('../auth');
const eventBus = require('../events');
const {text,httpUrl}=require('../security');
router.use((req,res,next)=>{if(['POST','PUT'].includes(req.method)){const b=req.body;if(['title','description','category'].some(key=>b[key]!==undefined&&!text(b[key],key==='description'?5000:200))||['repoUrl','demoUrl'].some(key=>b[key]!==undefined&&!httpUrl(b[key]))||(b.techStack!==undefined&&!(typeof b.techStack==='string'&&text(b.techStack,500))&&!(Array.isArray(b.techStack)&&b.techStack.length<=8&&b.techStack.every(item=>text(item,50)))))return res.status(400).json({error:'Invalid project fields.'});}next();});

function isValidHttpUrl(string) {
  if (!string) return false;
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// GET /api/projects
router.get('/', async (req, res) => {
  const { category, search } = req.query;
  const projects = await db.getProjects({ category, search, status: 'approved' });
  res.json({ projects });
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  const project = await db.getProjectById(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  let userInteraction = { voted: false, bookmarked: false };
  if (req.user) {
    const interactions = await db.getUserInteractions(req.user.id);
    userInteraction.voted = interactions.votes.includes(project.id);
    userInteraction.bookmarked = interactions.bookmarks.includes(project.id);
  }

  res.json({ project, interaction: userInteraction });
});

// POST /api/projects
router.post('/', requireAuth, async (req, res) => {
  const { title, description, category, techStack, repoUrl, demoUrl } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    return res.status(400).json({ error: 'Title is required (minimum 3 characters).' });
  }
  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    return res.status(400).json({ error: 'Description must be at least 10 characters long.' });
  }
  if (!category || typeof category !== 'string') {
    return res.status(400).json({ error: 'Category is required (e.g., Web, Mobile, Security, AI, Game).' });
  }
  if (!repoUrl || !isValidHttpUrl(repoUrl)) {
    return res.status(400).json({ error: 'A valid repository URL (e.g. https://github.com/...) is required.' });
  }
  if (demoUrl && !isValidHttpUrl(demoUrl)) {
    return res.status(400).json({ error: 'Live demo must be a valid URL.' });
  }

  const stack = Array.isArray(techStack)
    ? techStack.map(s => String(s).trim()).filter(Boolean).slice(0, 8)
    : (typeof techStack === 'string' ? techStack.split(',').map(s => s.trim()).filter(Boolean).slice(0, 8) : []);

  const project = await db.createProject({
    userId: req.user.id,
    title,
    description,
    category,
    techStack: stack,
    repoUrl,
    demoUrl
  });

  // Broadcast real-time project creation
  eventBus.broadcast({
    type: 'project_created',
    username: req.user.username,
    project: {
      id: project.id,
      title: project.title,
      category: project.category,
      description: project.description
    },
    message: `${req.user.username} published a new project: "${project.title}"`
  });

  res.status(201).json({
    message: 'Project published to community showcase! 50 XP awarded.',
    project
  });
});

// PUT /api/projects/:id
router.put('/:id', requireAuth, async (req, res) => {
  const { title, description, category, techStack, repoUrl, demoUrl } = req.body;

  try {
    const stack = Array.isArray(techStack) ? techStack : (techStack ? techStack.split(',').map(s => s.trim()) : undefined);
    const updated = await db.updateProject(req.params.id, req.user.id, {
      title,
      description,
      category,
      techStack: stack,
      repoUrl,
      demoUrl
    });

    if (!updated) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    res.json({ message: 'Project successfully updated.', project: updated });
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return res.status(403).json({ error: 'You are not authorized to edit this project.' });
    }
    res.status(500).json({ error: 'Database operation failed.' });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin' || req.user.role === 'moderator';
    const deleted = await db.deleteProject(req.params.id, req.user.id, isAdmin);
    if (!deleted) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    res.json({ message: 'Project removed.' });
  } catch (err) {
    if (err.message === 'Unauthorized') {
      return res.status(403).json({ error: 'You are not authorized to delete this project.' });
    }
    res.status(500).json({ error: 'Database operation failed.' });
  }
});

// POST /api/projects/:id/vote
router.post('/:id/vote', requireAuth, async (req, res) => {
  let project = await db.getProjectById(req.params.id);
  if (!project) {
    const all = await db.getProjects({});
    const cleanParam = req.params.id.toLowerCase().replace(/^prj-/, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    project = all.find(p => p.id === req.params.id || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === cleanParam);
  }
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  const {voted,votesCount}=await db.toggleProjectVote(req.user.id,project.id);

  // Real-Time Broadcast to all connected clients!
  const likerName = req.user.username;
  const userLoc = req.user.location || '';

  eventBus.broadcast({
    type: 'project_voted',
    projectId: project.id,
    projectTitle: project.title,
    voted,
    votesCount,
    username: likerName,
    location: userLoc,
    message: `${likerName}${userLoc ? ' from ' + userLoc : ''} liked "${project.title}"! (${votesCount} ${votesCount === 1 ? 'like' : 'likes'})`
  });

  return res.json({
    message: voted ? 'Upvote registered!' : 'Upvote removed.',
    voted,
    votesCount
  });
});

// POST /api/projects/:id/bookmark
router.post('/:id/bookmark', requireAuth, async (req, res) => {
  const project = await db.getProjectById(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  const result = await db.toggleProjectBookmark(req.user.id, project.id);
  res.json({
    message: result.bookmarked ? 'Saved to your bookmarks.' : 'Bookmark removed.',
    bookmarked: result.bookmarked,
    bookmarksCount: result.bookmarksCount
  });
});

module.exports = router;
