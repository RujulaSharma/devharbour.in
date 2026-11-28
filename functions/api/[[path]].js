export async function onRequest({ request, env }) {
  let backend;
  try {
    backend = new URL(env.RENDER_ORIGIN);
  } catch {
    return Response.json({ error: 'Backend not configured' }, { status: 503 });
  }
  if (backend.protocol !== 'https:' || backend.username || backend.password) {
    return Response.json({ error: 'Backend not configured' }, { status: 503 });
  }

  const incoming = new URL(request.url);
  backend.pathname = incoming.pathname;
  backend.search = incoming.search;
  backend.hash = '';

  try {
    const upstream = new Request(backend, request);
    // Retain the public host on same-origin GETs, which omit the Origin header.
    // Overwrite caller-supplied forwarding metadata at this trusted proxy.
    upstream.headers.set('X-Forwarded-Host', incoming.host);
    upstream.headers.set('X-Forwarded-Proto', incoming.protocol.slice(0, -1));
    // Keep credentials on the configured upstream if it returns a redirect.
    return await fetch(upstream, { redirect: 'manual' });
  } catch {
    return Response.json({ error: 'Backend unavailable' }, { status: 502 });
  }
}
