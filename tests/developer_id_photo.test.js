process.env.NODE_ENV = 'test';
process.env.DB_PROVIDER = 'sqlite';
process.env.DB_PATH = ':memory:';
const test = require('node:test');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const photo = require('../server/profile/id-card-photo');
const { render } = require('../server/profile/id-card-art');

test('ID photos accept only trusted HTTPS providers without redirects or arbitrary hosts', () => {
  const storage = 'https://project.supabase.co';
  for (const value of [
    'http://lh3.googleusercontent.com/a/photo', 'https://localhost/avatar',
    'https://lh3.googleusercontent.com.evil.test/a', 'https://evil.test/avatar',
    'https://user:secret@lh3.googleusercontent.com/a', 'https://lh3.googleusercontent.com:444/a',
    'https://project.supabase.co/rest/v1/users', 'https://other.supabase.co/storage/v1/object/a',
    'data:image/png;base64,AA==', 'file:///avatar.png',
  ]) assert.equal(photo.allowedPhotoUrl(value, storage), null);
  assert.equal(photo.allowedPhotoUrl('https://lh3.googleusercontent.com/a/photo'), 'https://lh3.googleusercontent.com/a/photo');
  assert.equal(photo.allowedPhotoUrl(storage + '/storage/v1/object/sign/avatar', storage), storage + '/storage/v1/object/sign/avatar');
});

test('photos are normalized to embedded raster images and unsafe or oversized responses are rejected', async t => {
  const savedFetch = global.fetch;
  t.after(() => { global.fetch = savedFetch; });
  const bytes = await sharp({ create: { width: 8, height: 8, channels: 3, background: '#8454ae' } }).png().toBuffer();
  global.fetch = async (_url, options) => {
    assert.equal(options.redirect, 'error');
    assert.ok(options.signal);
    return new Response(bytes, { headers: { 'content-type': 'image/png' } });
  };
  const value = await photo.imageData('https://lh3.googleusercontent.com/a/photo');
  assert.match(value, /^data:image\/png;base64,/);
  const image = await sharp(Buffer.from(value.split(',')[1], 'base64')).metadata();
  assert.deepEqual({ width: image.width, height: image.height }, { width: 720, height: 960 });
  const card = { fullName: 'Sample Developer', username: 'sample', developerId: 'DH-SAMPLE', photoDataUrl: value, showQrCode: false };
  const svg = await render(card);
  assert.match(svg, /<image href="data:image\/png;base64,/);
  await sharp(Buffer.from(svg)).png().toBuffer();
  assert.ok(!(await render({ ...card, photoDataUrl: 'https://evil.test/image.svg' })).includes('<image href='));
  for (const headers of [
    { 'content-type': 'image/svg+xml' },
    { 'content-type': 'image/png', 'content-length': '4194305' },
  ]) {
    global.fetch = async () => new Response(bytes, { headers });
    assert.equal(await photo.imageData('https://lh3.googleusercontent.com/a/photo'), null);
  }
  global.fetch = async () => new Response(new Uint8Array(4194305), { headers: { 'content-type': 'image/png' } });
  assert.equal(await photo.imageData('https://lh3.googleusercontent.com/a/photo'), null);
});
