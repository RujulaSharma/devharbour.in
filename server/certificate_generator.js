const fs = require('node:fs');
const path = require('node:path');
require('regenerator-runtime/runtime');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');

const ASSETS = path.join(__dirname, '..', 'assets');
const TEMPLATE_PATH = path.join(ASSETS, 'innovative_india_vector.pdf');
const FONT_PATH = path.join(ASSETS, 'fonts', 'EBGaramond-Bold-Static.ttf');
const FALLBACK_PATH = path.join(ASSETS, 'fonts', 'NotoSansDevanagari.ttf');
const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
const credentialPattern = /^IN-26-\d{7}$/;
let assets;

async function generateCertificatePdf({ recipientName, credentialId }) {
  if (typeof recipientName !== 'string' || !recipientName.trim() || !credentialPattern.test(credentialId)) {
    throw new Error('A signup name and Innovative India credential ID are required.');
  }
  if (!assets) assets = [TEMPLATE_PATH, FONT_PATH, FALLBACK_PATH].map(file => fs.readFileSync(file));
  const [template, mainFont, fallbackFont] = assets;
  const doc = await PDFDocument.load(template, { updateMetadata: false });
  doc.registerFontkit(fontkit);
  const titleFont = await doc.embedFont(mainFont, { subset: true });
  const idFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.getPage(0);
  const { width, height } = page.getSize();
  const primaryGlyphs = new Set(titleFont.getCharacterSet());
  let fallback;
  let fallbackGlyphs;
  const runs = [];
  for (const { segment } of segmenter.segment(recipientName)) {
    const chars = [...segment].map(char => char.codePointAt(0));
    let font = titleFont;
    if (!chars.every(char => primaryGlyphs.has(char))) {
      fallback ??= await doc.embedFont(fallbackFont, { subset: true });
      fallbackGlyphs ??= new Set(fallback.getCharacterSet());
      if (!chars.every(char => fallbackGlyphs.has(char) || char === 0x200c || char === 0x200d)) {
        const error = new Error('The certificate fonts cannot display this signup name.');
        error.code = 'CERTIFICATE_FONT_COVERAGE';
        throw error;
      }
      font = fallback;
    }
    if (runs.at(-1)?.font === font) runs.at(-1).text += segment;
    else runs.push({ font, text: segment });
  }
  const measureName = size => runs.reduce((sum, run) => sum + run.font.widthOfTextAtSize(run.text, size), 0);
  const normalSize = width * 0.04;
  const size = Math.min(normalSize, width * 0.55 * normalSize / measureName(normalSize));
  let x = (width - measureName(size)) / 2;
  for (const run of runs) {
    page.drawText(run.text, { x, y: height * 0.421, size, font: run.font, color: rgb(0, 0, 0) });
    x += run.font.widthOfTextAtSize(run.text, size);
  }

  const idSize = width * 0.014;
  page.drawText(credentialId, {
    x: width * 0.73 - idFont.widthOfTextAtSize(credentialId, idSize) / 2,
    y: height * 0.184,
    size: idSize,
    font: idFont,
    color: rgb(0.06, 0.12, 0.24)
  });

  doc.setTitle('Innovative India Certificate — ' + recipientName);
  doc.setAuthor('Dev Harbour');
  doc.setSubject('Certificate of Participation — ' + credentialId);
  return doc.save();
}

module.exports = { generateCertificatePdf, TEMPLATE_PATH, FONT_PATH };
