const PUBLIC_ORIGINS = new Set(['https://devharbour.in', 'https://www.devharbour.in']);
const PUBLIC_HOSTS = new Set(['devharbour.in', 'www.devharbour.in']);
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

function requestHost(req) {
  try { return new URL((req.protocol || 'https') + '://' + req.get('host')).hostname; }
  catch { return ''; }
}
function publicSiteRequest(req) {
  // Origin remains the browser's public origin when the proxy rewrites Host.
  // Forwarded metadata can only select this fixed, allowlisted cookie domain.
  // It never grants permission to use cookies; Origin/Fetch-Site are checked separately.
  return PUBLIC_ORIGINS.has(req.headers.origin) || PUBLIC_HOSTS.has(requestHost(req)) ||
    (!req.headers.origin && PUBLIC_HOSTS.has(req.headers['x-forwarded-host']));
}
function applicationBaseUrl(req) {
  if (PUBLIC_ORIGINS.has(req.headers.origin)) return req.headers.origin;
  const host = requestHost(req);
  if (PUBLIC_HOSTS.has(host)) return 'https://' + host;
  const localRequest = process.env.NODE_ENV !== 'production' && LOCAL_HOSTS.has(host);
  try {
    const configured = new URL(process.env.APP_BASE_URL);
    if (!configured.username && !configured.password) {
      if (configured.protocol === 'https:' && !LOCAL_HOSTS.has(configured.hostname)) return configured.origin;
      if (localRequest && ['http:', 'https:'].includes(configured.protocol) && LOCAL_HOSTS.has(configured.hostname)) return configured.origin;
    }
  } catch {}
  return localRequest ? req.protocol + '://' + req.get('host') : 'https://www.devharbour.in';
}

module.exports = { PUBLIC_ORIGINS, publicSiteRequest, applicationBaseUrl };
