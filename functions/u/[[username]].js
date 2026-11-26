// Public profile routes serve the SPA with privacy-checked Open Graph metadata from the backend.
export async function onRequest({request,env}) {
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
  if(!env.RENDER_ORIGIN)return new Response('Profile service unavailable',{status:503});
  const username=new URL(request.url).pathname.split('/').filter(Boolean)[1]||'';
  if(!/^[A-Za-z0-9_-]{3,30}$/.test(username))return new Response('Profile not found',{status:404});
  const origin=new URL(env.RENDER_ORIGIN);
  if(origin.protocol!=='https:'||origin.username||origin.password)return new Response('Profile service unavailable',{status:503});
  origin.pathname='/u/'+encodeURIComponent(username);origin.search='';
  try{const upstream=await fetch(origin,{method:request.method,redirect:'manual'});return new Response(upstream.body,{status:upstream.status,headers:{'Content-Type':upstream.headers.get('content-type')||'text/html','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'}});}catch{return new Response('Profile service unavailable',{status:503});}
}
