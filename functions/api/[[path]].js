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
    // Keep credentials on the configured upstream if it returns a redirect.
    return await fetch(new Request(backend, request), { redirect: 'manual' });
  } catch {
    return Response.json({ error: 'Backend unavailable' }, { status: 502 });
  }
}
