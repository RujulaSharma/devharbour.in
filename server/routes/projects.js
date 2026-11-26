const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../auth');
const eventBus = require('../events');

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
  try {
    const { category, search } = req.query;
    const projects = await db.getProjects({ category, search, status: 'approved' });
    const interactions = req.user?.emailVerified ? await db.getUserInteractions(req.user.id) : null;
    res.set('Cache-Control', 'private, no-store').json({ projects: projects || [], votedProjectIds: interactions?.votes || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve projects.' });
  }
});

// GET /api/projects/orcathon
router.get('/orcathon', async (req, res) => {
  try {
    const projects = await db.getOrcathonProjects(req.user?.emailVerified ? req.user.id : null);
    res.set('Cache-Control', 'private, no-store').json({ projects });
  } catch (err) {
    res.status(503).json({ error: 'ORCATHON projects are temporarily unavailable.' });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const project = await db.getProjectById(req.params.id);
    const ownsProject = req.user && project && (project.user_id ?? project.userId) === req.user.id;
    if (!project || (project.status !== 'approved' && !ownsProject && !['admin', 'moderator'].includes(req.user?.role))) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    let userInteraction = { voted: false, bookmarked: false };
    if (req.user) {
      const interactions = await db.getUserInteractions(req.user.id);
      userInteraction.voted = (interactions && interactions.votes) ? interactions.votes.includes(project.id) : false;
      userInteraction.bookmarked = (interactions && interactions.bookmarks) ? interactions.bookmarks.includes(project.id) : false;
    }

    res.json({ project, interaction: userInteraction });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load project details.' });
  }
});

// POST /api/projects
router.post('/', requireAuth, async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to publish project.' });
  }
});

// PUT /api/projects/:id
router.put('/:id', requireAuth, async (req, res) => {
  const { title, description, category, techStack, repoUrl, demoUrl } = req.body;

  if (title !== undefined && (typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 100)) {
    return res.status(400).json({ error: 'Title must be between 3 and 100 characters.' });
  }
  if (description !== undefined && (typeof description !== 'string' || description.trim().length < 10 || description.trim().length > 2000)) {
    return res.status(400).json({ error: 'Description must be between 10 and 2000 characters.' });
  }
  if (category !== undefined && (typeof category !== 'string' || category.trim().length > 50)) {
    return res.status(400).json({ error: 'Valid category is required.' });
  }
  if (repoUrl !== undefined && !isValidHttpUrl(repoUrl)) {
    return res.status(400).json({ error: 'A valid repository URL is required.' });
  }
  if (demoUrl && !isValidHttpUrl(demoUrl)) {
    return res.status(400).json({ error: 'Live demo must be a valid URL.' });
  }

  try {
    const stack = Array.isArray(techStack)
      ? techStack.map(s => String(s).trim()).filter(Boolean).slice(0, 8)
      : (typeof techStack === 'string' ? techStack.split(',').map(s => s.trim()).filter(Boolean).slice(0, 8) : undefined);
    const updated = await db.updateProject(req.params.id, req.user.id, {
      title: title !== undefined ? title.trim() : undefined,
      description: description !== undefined ? description.trim() : undefined,
      category: category !== undefined ? category.trim() : undefined,
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
    res.status(500).json({ error: 'Failed to update project.' });
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
    res.status(500).json({ error: 'Failed to delete project.' });
  }
});

// POST /api/projects/:id/vote
router.post('/:id/vote', requireAuth, async (req, res) => {
  try {
    const target = req.params.id;
    const isGalleryId = /^orcathon-[a-f0-9]{24}$/.test(target);
    let project;
    let vote;
    if (isGalleryId) {
      const gallery = (await db.getOrcathonProjects()).find(row => row.id === target);
      if (gallery) {
        project = { id: gallery.id, title: gallery.name };
        vote = await db.toggleGalleryVote(req.user.id, gallery.id);
      }
    } else {
      project = await db.getProjectById(target);
      if (!project) {
        const all = await db.getProjects({ status: 'approved' });
        const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const cleanParam = slug(target.replace(/^prj-/, ''));
        project = all.find(row => slug(row.title) === cleanParam);
        if (!project) {
          const gallery = (await db.getOrcathonProjects()).find(row => slug(row.name) === cleanParam);
          if (gallery) {
            project = { id: gallery.id, title: gallery.name };
            vote = await db.toggleGalleryVote(req.user.id, gallery.id);
          }
        }
      }
      if (project?.status === 'approved') vote = await db.toggleProjectVote(req.user.id, project.id);
    }
    if (!vote) return res.status(404).json({ error: 'Published project not found.' });
    const { voted, votesCount } = vote;
    const likerName = req.user.username || req.user.full_name || 'A developer';

    eventBus.broadcast({
      type: 'project_voted',
      projectId: project.id,
      projectTitle: project.title,
      voted,
      votesCount,
      username: likerName,
      message: `${likerName} ${voted ? 'liked' : 'unliked'} "${project.title}"! (${votesCount} ${votesCount === 1 ? 'like' : 'likes'})`
    });

    return res.json({
      message: voted ? 'Upvote registered!' : 'Upvote removed.',
      voted,
      votesCount
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process upvote.' });
  }
});

// POST /api/projects/:id/view
router.post('/:id/view', async (req, res) => {
  try {
    const project = await db.getProjectById(req.params.id);
    if (!project || project.status !== 'approved') {
      return res.status(404).json({ error: 'Project not found.' });
    }
    const viewsCount = await db.incrementProjectViews(project.id);
    res.json({ viewsCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record project view.' });
  }
});

// POST /api/projects/:id/bookmark
router.post('/:id/bookmark', requireAuth, async (req, res) => {
  try {
    const project = await db.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    if (project.status !== 'approved' && (project.user_id ?? project.userId) !== req.user.id) return res.status(404).json({ error: 'Project not found.' });
    const result = await db.toggleProjectBookmark(req.user.id, project.id);
    res.json({
      message: result.bookmarked ? 'Saved to your bookmarks.' : 'Bookmark removed.',
      bookmarked: result.bookmarked,
      bookmarksCount: result.bookmarksCount
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle bookmark.' });
  }
});

module.exports = router;
