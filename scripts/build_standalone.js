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
const source = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');
const html = source.replace(assetUrl, (reference, quote, file) => {
  if (!assets[file]) return reference;
  const bytes = fs.readFileSync(path.join(publicDir, 'assets', file));
  return quote + 'data:' + assets[file] + ';base64,' + bytes.toString('base64') + quote;
}).replace(/[\t ]+$/gm, '');
for (const file of ['public/downloads/devharbour_standalone.html', 'output/devharbour_standalone.html', 'standalone/index.html']) {
  fs.writeFileSync(path.join(root, file), html, 'utf8');
}
console.log('Built the standalone download from public/index.html.');
