const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');
const assets = {
  'devharbour-logo.png': 'image/png',
  'devharbour-icon-32.png': 'image/png',
  'devharbour-icon-96.png': 'image/png',
  'devharbour-icon-180.png': 'image/png',
  'innovative_india_certificate.webp': 'image/webp',
  'eb-garamond-bold.ttf': 'font/ttf',
  'noto-sans-devanagari.ttf': 'font/ttf',
  'emergency-e-card-thumbnail.svg': 'image/svg+xml',
  'lively-thumbnail.svg': 'image/svg+xml',
  'pipos-thumbnail.svg': 'image/svg+xml'
};
const assetUrl = /(["'])(?:\/?assets\/)([\w.-]+)(?:\?v=[\w.-]+)?\1/g;
const source = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8').replace('<link rel="stylesheet" href="/assets/profile-page.css">', () => '<style>' + fs.readFileSync(path.join(publicDir, 'assets', 'profile-page.css'), 'utf8') + '</style>').replace('<script src="/assets/profile-page.js"></script>', () => '<script>' + fs.readFileSync(path.join(publicDir, 'assets', 'profile-page.js'), 'utf8') + '</script>').replace(
  '<script src="/assets/privacy-choices.js" defer></script>',
  () => '<script>' + fs.readFileSync(path.join(publicDir, 'assets', 'privacy-choices.js'), 'utf8') + '</script>'
);
const bundledSource = source.replace('<script src="/assets/study-together.js"></script>',
  () => '<script>' + fs.readFileSync(path.join(publicDir, 'assets', 'study-together.js'), 'utf8') + '</script>');
const html = bundledSource.replace(assetUrl, (reference, quote, file) => {
  if (!assets[file]) return reference;
  const bytes = fs.readFileSync(path.join(publicDir, 'assets', file));
  return quote + 'data:' + assets[file] + ';base64,' + bytes.toString('base64') + quote;
}).replace(/[\t ]+$/gm, '');
for (const file of ['public/downloads/devharbour_standalone.html', 'output/devharbour_standalone.html', 'standalone/index.html']) {
  fs.writeFileSync(path.join(root, file), html, 'utf8');
}
console.log('Built the standalone download from public/index.html.');
