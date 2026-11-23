// Keep the serverless entry point on the same leaderboard route as the backend.
const app = require('./index');
module.exports = (req, res) => {
  req.url = '/api/leaderboard' + (req.url?.includes('?') ? req.url.slice(req.url.indexOf('?')) : '');
  return app(req, res);
};
