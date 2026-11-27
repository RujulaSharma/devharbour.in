const sharp = require('sharp');
const { profilePrisma } = require('./prisma');
const media = require('./media');
const cache = new Map();
const MAX_BYTES = 4 * 1024 * 1024;

function allowedPhotoUrl(value, storageOrigin) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443')) return null;
    const google = /^[a-z0-9-]+\.googleusercontent\.com$/i.test(url.hostname);
    const storage = storageOrigin && url.origin === new URL(storageOrigin).origin && url.pathname.startsWith('/storage/v1/object/');
    return google || storage ? url.href : null;
  } catch { return null; }
}

async function imageData(url) {
  const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(5000) });
  if (!response.ok || !/^image\/(png|jpeg|webp)(;|$)/i.test(response.headers.get('content-type') || '')) return null;
  if (Number(response.headers.get('content-length')) > MAX_BYTES) return null;
  const chunks = [];
  let length = 0;
  for await (const chunk of response.body) {
    length += chunk.length;
    if (length > MAX_BYTES) return null;
    chunks.push(chunk);
  }
  const bytes = await sharp(Buffer.concat(chunks), { limitInputPixels: 16000000 })
    .rotate().resize(720, 960, { fit: 'cover', position: 'attention' }).png().toBuffer();
  return 'data:image/png;base64,' + bytes.toString('base64');
}

async function forUser(user) {
  // Called only after the ID-card access check. Private uploads remain private.
  const record = await profilePrisma().profileMedia.findFirst({ where: { userId: user.id, kind: 'avatar' }, orderBy: { createdAt: 'desc' } });
  const key = user.id + ':' + (record?.id || user.avatar_url || 'none');
  const saved = cache.get(key);
  if (saved?.expires > Date.now()) return saved.value;
  let value = null;
  try {
    const source = record && media.configured() ? await media.signed(record) : user.avatar_url;
    const url = allowedPhotoUrl(source, record ? process.env.SUPABASE_URL : undefined);
    if (url) value = await imageData(url);
  } catch { /* A missing photo must not prevent viewing or downloading the ID. */ }
  if (cache.size >= 32) cache.delete(cache.keys().next().value);
  cache.set(key, { value, expires: Date.now() + 5 * 60000 });
  return value;
}

module.exports = { forUser, allowedPhotoUrl, imageData };
