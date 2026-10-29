// Public exact-ID verification shares the authoritative database implementation.
module.exports = require('../../../server/serverless-certificate')(req =>
  '/api/certificates/verify/' + encodeURIComponent(typeof req.query?.id === 'string' ? req.query.id : 'invalid'));
