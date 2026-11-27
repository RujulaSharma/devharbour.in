// The parameter page is generic HTML; its API requests enforce profile privacy.
export async function onRequest({ request, env }) {
  if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405 });
  const parts = new URL(request.url).pathname.split('/').filter(Boolean);
  const id = parts[1] || '';
  if (parts.length !== 2 || !/^DH-[A-Z0-9_-]{1,80}$/i.test(id)) return new Response('ID card not found', { status: 404 });
  let backend;
  try { backend = new URL(env.RENDER_ORIGIN); }
  catch { return new Response('ID card service unavailable', { status: 503 }); }
  if (backend.protocol !== 'https:' || backend.username || backend.password) return new Response('ID card service unavailable', { status: 503 });
  backend.pathname = '/id/' + encodeURIComponent(id);
  backend.search = '';
  backend.hash = '';
  try {
    const response = await fetch(backend, { method: request.method, redirect: 'manual' });
    return new Response(response.body, { status: response.status, headers: {
      'Content-Type': response.headers.get('content-type') || 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    } });
  } catch { return new Response('ID card service unavailable', { status: 503 }); }
}
