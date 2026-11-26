const fs = require('node:fs');
const path = require('node:path');
require('regenerator-runtime/runtime');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const layouts = require('../public/assets/certificates/layouts.json');

const PUBLIC = path.join(__dirname, '..', 'public');
const FONT_PATH = path.join(__dirname, '..', 'assets/fonts/EBGaramond-Bold-Static.ttf');
const FALLBACK_PATH = path.join(__dirname, '..', 'assets/fonts/NotoSansDevanagari.ttf');
const TEMPLATE_PATH = path.join(PUBLIC, layouts['innovative-india'].template);
const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
const templates = new Map();
let fallbackBytes;

function color(hex) {
  return rgb(...[1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16) / 255));
}

async function drawName(document, page, name, layout, primary) {
  const supported = new Set(primary.getCharacterSet());
  let fallback, fallbackGlyphs;
  const runs = [];
  for (const { segment } of segmenter.segment(name)) {
    const points = [...segment].map(char => char.codePointAt(0));
    let font = primary;
    if (!points.every(point => supported.has(point))) {
      fallbackBytes ??= fs.readFileSync(FALLBACK_PATH);
      fallback ??= await document.embedFont(fallbackBytes, { subset: true });
      fallbackGlyphs ??= new Set(fallback.getCharacterSet());
      if (!points.every(point => fallbackGlyphs.has(point) || point === 0x200c || point === 0x200d)) {
        const error = new Error('This name needs a supported certificate font.');
        error.code = 'CERTIFICATE_FONT_COVERAGE';
        throw error;
      }
      font = fallback;
    }
    if (runs.at(-1)?.font === font) runs.at(-1).text += segment;
    else runs.push({ font, text: segment });
  }
  const measure = size => runs.reduce((total, run) => total + run.font.widthOfTextAtSize(run.text, size), 0);
  const size = Math.min(layout.name.size, layout.name.maxWidth * layout.name.size / measure(layout.name.size));
  let x = layout.name.x - measure(size) / 2;
  for (const run of runs) {
    page.drawText(run.text, { x, y: layout.height - layout.name.baseline, size, font: run.font, color: color(layout.name.color) });
    x += run.font.widthOfTextAtSize(run.text, size);
  }
}

async function renderCertificate(event, { recipientName, credentialId }) {
  const innovative = event === 'innovative-india';
  const validId = innovative ? /^IN-26-\d{7}$/.test(credentialId) : typeof credentialId === 'string' && /^[A-Za-z0-9-]{5,120}$/.test(credentialId);
  if (typeof recipientName !== 'string' || !recipientName.trim() || !validId) {
    throw new Error('A certificate name and valid credential ID are required.');
  }
  const layout = layouts[event];
  if (!templates.has(event)) templates.set(event, fs.readFileSync(path.join(PUBLIC, layout.template)));
  const document = await PDFDocument.create();
  // Keep repeated downloads byte-stable; credential metadata supplies the identity.
  document.setCreationDate(new Date('2026-01-01T00:00:00Z'));
  document.setModificationDate(new Date('2026-01-01T00:00:00Z'));
  document.registerFontkit(fontkit);
  const page = document.addPage([layout.width, layout.height]);
  const image = await document.embedPng(templates.get(event));
  page.drawImage(image, { x: 0, y: 0, width: layout.width, height: layout.height });
  const primary = await document.embedFont(StandardFonts.TimesRomanBold);
  await drawName(document, page, layout.uppercase ? recipientName.toUpperCase() : recipientName, layout, primary);
  const idFont = layout.credential.font === 'serif' ? primary : await document.embedFont(StandardFonts.HelveticaBold);
  const idLayout = layout.credential;
  const idSize = Math.min(idLayout.size, idLayout.maxWidth * idLayout.size / idFont.widthOfTextAtSize(credentialId, idLayout.size));
  page.drawText(credentialId, {
    x: idLayout.x - idFont.widthOfTextAtSize(credentialId, idSize) / 2,
    y: layout.height - idLayout.baseline,
    size: idSize, font: idFont, color: color(idLayout.color),
  });
  document.setTitle((innovative ? 'Innovative India' : 'Orcathon') + ' Certificate — ' + recipientName);
  document.setAuthor('Dev Harbour');
  document.setSubject('Certificate of Participation — ' + credentialId);
  return document.save();
}

const generateCertificatePdf = details => renderCertificate('innovative-india', details);
const generateOrcathonCertificatePdf = details => renderCertificate('orcathon', details);
module.exports = { generateCertificatePdf, generateOrcathonCertificatePdf, TEMPLATE_PATH, FONT_PATH };
