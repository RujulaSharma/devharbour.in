// Route both Vercel entry points through the same session and owner checks.
const app = require('../index');
module.exports = (req, res) => {
  req.url = '/api/certificates/claim';
  return app(req, res);
};
