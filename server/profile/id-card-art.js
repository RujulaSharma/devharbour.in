const QRCode = require('qrcode');
const { esc, origin } = require('./exports');
const W = 720, H = 980;

const definitions = `<defs>
  <linearGradient id="base" x2="1" y2="1"><stop stop-color="#13101c"/><stop offset=".5" stop-color="#050408"/><stop offset="1" stop-color="#1c0d2c"/></linearGradient>
  <linearGradient id="metal" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#918e9b"/><stop offset=".07" stop-color="#3e3c46"/><stop offset=".25" stop-color="#25222e"/><stop offset=".58" stop-color="#21182e"/><stop offset=".86" stop-color="#3e245b"/><stop offset="1" stop-color="#713598"/></linearGradient>
  <linearGradient id="rail" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#413d4b"/><stop offset=".15" stop-color="#24202f"/><stop offset=".75" stop-color="#291934"/><stop offset="1" stop-color="#7c40a0"/></linearGradient>
  <linearGradient id="edge" x2=".8" y2="1"><stop stop-color="#e6e0ee"/><stop offset=".2" stop-color="#77717e"/><stop offset=".5" stop-color="#b095c3"/><stop offset="1" stop-color="#bc69f0"/></linearGradient>
  <linearGradient id="glass" x2="1" y2="1"><stop stop-color="#b85fff" stop-opacity=".17"/><stop offset=".46" stop-color="#f6d7ff" stop-opacity="0"/><stop offset="1" stop-color="#a35aff" stop-opacity=".3"/></linearGradient>
  <linearGradient id="photoShade" x2="0" y2="1"><stop offset=".35" stop-color="#08040e" stop-opacity="0"/><stop offset="1" stop-color="#100718" stop-opacity=".88"/></linearGradient>
  <linearGradient id="chip" x2="1" y2="1"><stop stop-color="#ded8e7"/><stop offset=".32" stop-color="#9d91af"/><stop offset=".5" stop-color="#f4d6ff"/><stop offset="1" stop-color="#65616c"/></linearGradient>
  <radialGradient id="violet"><stop stop-color="#9a3bff" stop-opacity=".64"/><stop offset="1" stop-color="#7a20cf" stop-opacity="0"/></radialGradient>
  <radialGradient id="portrait"><stop stop-color="#564276"/><stop offset=".7" stop-color="#252139"/><stop offset="1" stop-color="#10101b"/></radialGradient>
  <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7"/></filter>
  <clipPath id="shell"><rect x="10" y="10" width="700" height="960" rx="38"/></clipPath>
  <clipPath id="portraitCut"><path d="M177 88H558V378L588 410V727L510 805H285L245 846H132V252H114V151Q114 88 177 88Z"/></clipPath>
</defs>`;

function star(x, y, size = 22) {
  return `<path d="M${x} ${y-size}Q${x+3} ${y-3} ${x+size} ${y}Q${x+3} ${y+3} ${x} ${y+size}Q${x-3} ${y+3} ${x-size} ${y}Q${x-3} ${y-3} ${x} ${y-size}Z" fill="#ead7ff"/>`;
}
function screws(x, y) {
  return `<g fill="#0b080e" stroke="#aaa2b4" stroke-width="1.3"><circle cx="${x}" cy="${y}" r="5"/><circle cx="${x+18}" cy="${y}" r="5"/></g>`;
}
function text(value, x, y, size = 14, color = '#f8efff', extra = '') {
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${esc(value)}</text>`;
}
function initials(name) { return name.trim().split(/\s+/).slice(0, 2).map(x => [...x][0]).join('').toUpperCase(); }
function nameSize(name, max = 44, width = 348) { return Math.min(max, width / Math.max(1, [...name].length * .64)); }
function fittedText(value, x, y, size, width, color, extra = '') {
  const fittedSize = Math.min(size, width / Math.max(1, [...String(value)].length * .64));
  return text(value, x, y, fittedSize, color, extra);
}
function frontName(value) {
  if ([...value].length <= 27) return text(value, 131, 858, nameSize(value), '#fff4ff', 'font-weight="800"');
  const characters = [...value];
  const middle = Math.ceil(characters.length / 2);
  const spaces = characters.flatMap((character, index) => /\s/.test(character) ? [index] : []);
  const split = spaces.length ? spaces.sort((a, b) => Math.abs(a - middle) - Math.abs(b - middle))[0] : middle;
  return [characters.slice(0, split).join('').trim(), characters.slice(split).join('').trim()]
    .map((line, i) => fittedText(line, 131, 840 + i * 28, 25, 348, '#fff4ff', 'font-weight="800"')).join('');
}
async function qr(card, x, y, size) {
  if (!card.showQrCode) return '';
  const svg = await QRCode.toString(origin() + card.pageUrl, { type: 'svg', margin: 2 });
  const viewBox = svg.match(/viewBox="([^"]+)"/)[1];
  return `<rect x="${x-5}" y="${y-5}" width="${size+10}" height="${size+10}" rx="9" fill="#f7f3fc" stroke="#b894d3"/><svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${viewBox}">${svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')}</svg>`;
}

async function front(card) {
  const photo = /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(card.photoDataUrl || '')
    ? `<image href="${card.photoDataUrl}" x="112" y="88" width="478" height="760" preserveAspectRatio="xMidYMid slice"/>`
    : `<rect x="112" y="88" width="478" height="760" fill="url(#portrait)"/><circle cx="350" cy="365" r="113" fill="#86739b" fill-opacity=".19"/><path d="M150 797V695Q160 534 350 534Q540 534 574 695V797Z" fill="#ae8bce" fill-opacity=".12"/>${text(initials(card.fullName), 350, 398, 92, '#c2aed7', 'text-anchor="middle" font-weight="700"')}`;
  const member = card.title || 'Developer';
  const name = card.fullName.toUpperCase();
  return `<g clip-path="url(#shell)">
    <rect width="720" height="980" fill="url(#base)"/>
    <ellipse cx="180" cy="190" rx="250" ry="300" fill="url(#violet)"/>
    <path d="M125 710V154Q125 91 182 91H554" fill="none" stroke="#bd57ff" stroke-width="18" filter="url(#glow)"/>
    <g clip-path="url(#portraitCut)">${photo}<rect x="112" y="88" width="478" height="760" fill="url(#photoShade)"/></g>
    <path d="M42 94L80 47H145L174 76H344L375 47H488V88H177Q114 88 114 151V252H132V748L101 782H46V613L73 584V452L42 420Z" fill="url(#metal)" stroke="url(#edge)" stroke-width="1.6"/>
    <path d="M132 748V252H114V151Q114 88 177 88H488" fill="none" stroke="#d177ff" stroke-width="3"/>
    <path d="M560 31H666L702 66V897L666 949H578L521 891V818L588 751V410L560 378Z" fill="url(#rail)" stroke="url(#edge)" stroke-width="1.6"/>
    <path d="M568 38H662L694 70V893L661 941H583L529 887" fill="none" stroke="#e0bee9" stroke-opacity=".22"/>
    <rect x="566" y="35" width="131" height="907" fill="url(#glass)"/>
    <g transform="translate(652 129) rotate(90)" font-weight="700">
      ${text('DEV HARBOUR ID', 0, 0, 10, '#cfb2e5', 'letter-spacing="1.7"')}
      ${fittedText(card.developerId, 0, 20, 14, 200)}
      ${text('MEMBER SINCE', 222, 0, 10, '#cfb2e5', 'letter-spacing="1.5"')}
      ${text(card.memberSince || 'Dev Harbour', 222, 20, 13)}
      ${text('MEMBER CLASS', 411, 0, 10, '#cfb2e5', 'letter-spacing="1.5"')}
      ${fittedText(member.toUpperCase(), 411, 20, 13, 190)}
    </g>
    ${star(654, 104, 24)}
    ${await qr(card, 86, 176, 80)}
    <rect x="82" y="285" width="77" height="73" rx="8" fill="url(#chip)" stroke="#dbcae7" stroke-width="1.3"/>
    <g fill="none" stroke="#73667f" stroke-opacity=".55"><rect x="103" y="305" width="34" height="32" rx="6"/><path d="M82 310H103M137 310H159M82 332H103M137 332H159M111 285V305M129 285V305M111 337V358M129 337V358"/></g>
    ${text('DEV HARBOUR', -700, 95, 15, '#d5a8fa', 'transform="rotate(-90)" letter-spacing="4"')}
    <path d="M76 801H241L272 767H471L506 802V859L590 948H489L449 907H149L108 949H64L40 924V839Z" fill="url(#metal)" stroke="url(#edge)" stroke-width="1.5"/>
    <path d="M47 849L78 817H247L279 781H462L491 809" fill="none" stroke="#d490ff" stroke-opacity=".35"/>
    <rect x="83" y="830" width="32" height="76" fill="#c582e8" fill-opacity=".1"/>
    <path d="M85 831V904M90 831V904M97 831V904M106 831V904M112 831V904" stroke="#c7a3e5" stroke-width="2"/>
    ${text('NAME', 133, 812, 11, '#dfc6ef', 'font-weight="700" letter-spacing="2"')}
    ${frontName(name)}
    ${fittedText('@' + card.username, 133, 889, 13, 345, '#e2c7f6')}
    ${text('COMMUNITY / DEVELOPER', 161, 940, 9, '#cdb7dd', 'letter-spacing="1.4"')}
    <g transform="translate(625 818)" fill="none" stroke="#e8d6f4" stroke-width="3"><ellipse rx="45" ry="23" transform="rotate(-50)"/><ellipse rx="45" ry="23" transform="rotate(50)"/><circle r="31"/></g>
    ${text('DH', 625, 882, 38, '#fff4ff', 'text-anchor="middle" font-weight="800" font-style="italic"')}
    ${screws(68, 78)}${screws(70, 925)}
    ${text('01 / FRONT', 512, 26, 8, '#a18bab', 'text-anchor="end" letter-spacing="1.5"')}
  </g>`;
}

async function back(card) {
  const fields = [
    ['DEVELOPER ID', card.developerId], ['USERNAME', '@' + card.username],
    ['MEMBER SINCE', card.memberSince], ['MEMBER CLASS', card.title || 'Developer'],
    ...(card.level === null ? [] : [['PROGRESS', 'LEVEL ' + card.level + ' / ' + card.totalXp + ' XP']]),
  ];
  return `<g clip-path="url(#shell)">
    <rect width="720" height="980" fill="url(#base)"/>
    <ellipse cx="640" cy="840" rx="420" ry="390" fill="url(#violet)"/>
    <path d="M40 81L84 38H263L291 65H565L597 38H665L699 72V900L656 947H470L443 920H165L137 947H74L40 914Z" fill="url(#metal)" stroke="url(#edge)" stroke-width="2"/>
    <path d="M75 108H645V738L604 780H344L305 820H75Z" fill="#0e0b15" stroke="#9f71bd" stroke-opacity=".6"/>
    ${text('DEV HARBOUR', 105, 153, 30, '#f1dcff', 'font-weight="800" letter-spacing="3"')}
    ${text('DEVELOPER COMMUNITY', 107, 183, 11, '#b99acb', 'letter-spacing="3"')}
    ${star(598, 149, 23)}
    <path d="M106 214H611" stroke="#7b578e"/>
    ${text(card.fullName.toUpperCase(), 106, 263, Math.min(30, 490 / Math.max(1, [...card.fullName].length * .65)), '#fff2ff', 'font-weight="700"')}
    ${fields.map(([label, value], i) => text(label, 108, 319 + i * 66, 10, '#ad8bbd', 'letter-spacing="2"') + fittedText(value || '—', 108, 344 + i * 66, 18, 300, '#f0e5f7', 'font-weight="600"')).join('')}
    ${await qr(card, 435, 376, 160)}
    ${card.showQrCode ? text('SCAN TO VIEW PROFILE CARD', 515, 565, 8, '#c2a2d5', 'text-anchor="middle" letter-spacing="1"') : ''}
    <path d="M106 672H610" stroke="#7b578e"/>
    ${text('BUILD. LEARN. BELONG.', 107, 716, 20, '#dfbaff', 'font-weight="700" letter-spacing="2"')}
    ${text('DEVHARBOUR.IN', 107, 744, 11, '#a889bd', 'letter-spacing="3"')}
    <path d="M74 858H651M74 866H651M74 874H651M74 882H651" stroke="#bb8ce2" stroke-opacity=".24"/>
    ${text('Dev Harbour developer community · devharbour.in', 360, 913, 11, '#d0b8df', 'text-anchor="middle"')}
    ${screws(67, 73)}${screws(641, 912)}
    ${text('02 / REVERSE', 638, 26, 8, '#a18bab', 'text-anchor="end" letter-spacing="1.5"')}
  </g>`;
}

async function render(card, { side = 'front' } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Dev Harbour ${side === 'back' ? 'reverse' : 'front'} developer card">${definitions}<g font-family="Arial,Helvetica,sans-serif">${side === 'back' ? await back(card) : await front(card)}</g></svg>`;
}
module.exports = { render };
