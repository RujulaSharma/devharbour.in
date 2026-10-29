// Legacy Vercel endpoints share the authoritative Express database/auth checks.
// Do not reconstruct certificates from bundled participant JSON.
module.exports = route => (req, res) => {
  req.url = typeof route === 'function' ? route(req) : route;
  // Vercel may have consumed and parsed JSON before invoking the handler.
  if (req.body !== undefined) req._body = true;
  return require('./index')(req, res);
};
