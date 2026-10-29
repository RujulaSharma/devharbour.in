const router = require('../async-router').createRouter();
const { requireAuth } = require('../auth');
const { rateLimit } = require('express-rate-limit');
const { forRequest } = require('../email-verification');
const sendLimit = rateLimit({ windowMs: 3600000, limit: 100, standardHeaders: true, legacyHeaders: false });
const confirmLimit = rateLimit({ windowMs: 3600000, limit: 60, keyGenerator: req => req.user.id, standardHeaders: true, legacyHeaders: false });
router.use(requireAuth, (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
function reply(res, result) { const { status = 200, ...body } = result; return res.status(status).json(body); }
function validBody(req, fields) { return req.body && typeof req.body === 'object' && !Array.isArray(req.body) && Object.keys(req.body).every(key => fields.includes(key)); }
function endpoint(action) {
  return async (req, res) => {
    try { return await action(req, res); }
    catch { return res.status(503).json({ error: 'Email verification is temporarily unavailable. Contact the organiser if this continues.' }); }
  };
}
router.get('/', endpoint(async (req, res) => reply(res, await forRequest(req).status(req.user))));
router.post('/send', sendLimit, endpoint(async (req, res) => {
  if (!validBody(req, [])) return res.status(400).json({ error: 'The recipient must be your signed-in account. Do not supply an email address.' });
  return reply(res, await forRequest(req).send(req.user));
}));
router.post('/confirm', confirmLimit, endpoint(async (req, res) => {
  if (!validBody(req, ['code']) || typeof req.body.code !== 'string') return res.status(400).json({ error: 'A verification code is required.' });
  return reply(res, await forRequest(req).confirm(req.user, req.body.code));
}));
module.exports = router;
