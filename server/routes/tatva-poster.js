const router = require('express').Router();
const db = require('../db');
const { requireAuth, requireRole } = require('../auth');
const { csrf } = require('../profile/policy');

const table = 'tatva_poster_entries';
const statuses = ['new', 'eligible', 'needs_correction', 'shortlisted'];
const schema = `CREATE TABLE IF NOT EXISTS ${table} (
  user_id TEXT PRIMARY KEY, post_id TEXT NOT NULL UNIQUE, post_url TEXT NOT NULL,
  submitted_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','eligible','needs_correction','shortlisted')),
  note TEXT NOT NULL DEFAULT ''
)`;

async function rows(sql, ...params) {
  if (db.isPostgres() || process.env.VERCEL) {
    if (!db.pool) throw new Error('Poster database unavailable');
    let parameter = 0;
    return (await db.pool.query(sql.replace(/\?/g, () => '$' + ++parameter), params)).rows;
  }
  db.db.exec(schema);
  return db.db.prepare(sql).all(...params);
}

function challenge() {
  const deadline = Date.parse(process.env.TATVA_POSTER_DEADLINE || '');
  return { deadline: Number.isFinite(deadline) ? new Date(deadline).toISOString() : null, open: Date.now() < deadline };
}

function parseHttps(value) {
  if (typeof value !== 'string' || value.length > 2048) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && !url.username && !url.password ? url : null;
  } catch {
    return null;
  }
}

function linkedinPost(url) {
  if (!url || !['linkedin.com', 'www.linkedin.com'].includes(url.host)) return null;
  const path = url.pathname.replace(/\/$/, '');
  const feed = /^\/feed\/update\/urn:li:(activity|ugcPost|share):(\d{10,25})$/.exec(path);
  const post = /^\/posts\/[a-z0-9_%.-]+-(activity|ugcPost|share)-(\d{10,25})(?:-[a-z0-9]+)?$/i.exec(path);
  const match = feed || post;
  if (!match) return null;
  const [, kind, number] = match;
  const type = kind.toLowerCase() === 'ugcpost' ? 'ugcPost' : kind.toLowerCase();
  const id = type === 'activity' ? number : type + ':' + number;
  const canonicalPath = post && type !== 'activity' ? path : '/feed/update/urn:li:' + type + ':' + number;
  return { id, url: 'https://www.linkedin.com' + canonicalPath + '/' };
}

async function resolveLinkedinPost(value) {
  const url = parseHttps(value);
  if (url?.host !== 'lnkd.in') return linkedinPost(url);
  if (!/^\/(?:p\/)?[a-z0-9_-]{3,64}\/?$/i.test(url.pathname)) return null;
  const response = await fetch('https://lnkd.in' + url.pathname, {
    method: 'HEAD',
    redirect: 'manual',
    signal: AbortSignal.timeout(4000)
  });
  if (![301, 302, 303, 307, 308].includes(response.status)) return null;
  return linkedinPost(parseHttps(response.headers.get('location')));
}

router.use((_req, res, next) => { res.set('Cache-Control', 'private, no-store'); next(); });
router.get('/info', (_req, res) => res.json(challenge()));

router.get('/entry', requireAuth, async (req, res, next) => {
  try {
    const [entry] = await rows(`SELECT post_url, submitted_at, updated_at, status,
      CASE WHEN status = 'needs_correction' THEN note ELSE '' END AS note
      FROM ${table} WHERE user_id = ?`, req.user.id);
    res.json({ entry: entry || null, organizer: ['admin', 'moderator'].includes(req.user.role) });
  } catch (error) { next(error); }
});

router.post('/entry', requireAuth, csrf, async (req, res, next) => {
  if (!challenge().open) return res.status(409).json({ error: 'Submissions are closed.' });
  let post;
  try {
    post = await resolveLinkedinPost(req.body?.url);
  } catch {
    return res.status(503).json({ error: 'Could not open the LinkedIn short link. Try again or paste the full LinkedIn post URL.' });
  }
  if (!post) return res.status(400).json({ error: 'Paste a LinkedIn post URL or a LinkedIn short link that opens a post.' });
  try {
    const now = new Date().toISOString();
    const [entry] = await rows(`INSERT INTO ${table} (user_id, post_id, post_url, submitted_at, updated_at)
      VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET
      post_id = excluded.post_id, post_url = excluded.post_url, updated_at = excluded.updated_at,
      status = CASE WHEN ${table}.post_id = excluded.post_id THEN ${table}.status ELSE 'new' END,
      note = CASE WHEN ${table}.post_id = excluded.post_id THEN ${table}.note ELSE '' END
      RETURNING post_url, submitted_at, updated_at, status,
      CASE WHEN status = 'needs_correction' THEN note ELSE '' END AS note`,
    req.user.id, post.id, post.url, now, now);
    res.json({ entry });
  } catch (error) {
    if (error.code === '23505' || /UNIQUE constraint failed: tatva_poster_entries\.post_id/.test(error.message)) {
      return res.status(409).json({ error: 'This LinkedIn post has already been submitted.' });
    }
    next(error);
  }
});

router.get('/review', requireAuth, requireRole('admin', 'moderator'), async (_req, res, next) => {
  try {
    const entries = await rows(`SELECT e.user_id, e.post_url, e.submitted_at, e.updated_at, e.status, e.note,
      u.full_name FROM ${table} e JOIN users u ON u.id = e.user_id ORDER BY e.submitted_at DESC`);
    res.json({ entries });
  } catch (error) { next(error); }
});

router.patch('/review/:userId', requireAuth, requireRole('admin', 'moderator'), csrf, async (req, res, next) => {
  const { status, note = '', postUrl } = req.body || {};
  if (!statuses.includes(status) || typeof note !== 'string' || note.length > 1000 || typeof postUrl !== 'string'
    || (status === 'needs_correction' && !note.trim())) {
    return res.status(400).json({ error: 'Choose a status and provide a reason for corrections.' });
  }
  try {
    const [entry] = await rows(`UPDATE ${table} SET status = ?, note = ?
      WHERE user_id = ? AND post_url = ? RETURNING status, note`, status, note.trim(), req.params.userId, postUrl);
    if (!entry) return res.status(409).json({ error: 'Entry changed. Reload before reviewing it.' });
    res.json({ entry });
  } catch (error) { next(error); }
});

module.exports = router;
