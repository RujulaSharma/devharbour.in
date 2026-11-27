const db = require('../db');
const store = require('./store');
const progress = require('./progress');
const { esc, origin } = require('./exports');
const QRCode = require('qrcode');

function code(user) {
  return 'DH-' + String(user.id).replace(/^usr-/i, '').toUpperCase();
}

async function findUser(value) {
  if (typeof value !== 'string' || !/^DH-[A-Z0-9_-]{1,80}$/i.test(value)) return null;
  const matches = await progress.rows(`SELECT id FROM users WHERE
    upper(CASE WHEN lower(substr(id,1,4))='usr-' THEN substr(id,5) ELSE id END)=$1 LIMIT 2`,
  [value.slice(3).toUpperCase()]);
  if (matches.length !== 1) return null;
  return db.getUserById(matches[0].id);
}

async function details(user, viewer, options = {}) {
  const state = await store.access(user, viewer?.emailVerified === false ? null : viewer, options);
  if (!state.read || (!state.owner && (!state.sections.developerId || state.profile.details?.showDeveloperId === false))) {
    throw Object.assign(new Error('Developer ID card is private or unavailable.'), { status: 404 });
  }
  const stats = state.sections.statistics ? await progress.overview(user) : null;
  const date = new Date(user.created_at);
  return {
    developerId: code(user), fullName: user.full_name, username: user.username,
    headline: state.profile.headline || '',
    memberSince: Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : '',
    location: state.sections.location ? [state.profile.city, state.profile.state, state.profile.country].filter(Boolean).join(', ') : '',
    level: stats?.level ?? null, title: stats?.title ?? '', totalXp: stats?.totalXp ?? null,
    showQrCode: state.profile.details?.showQrCode !== false,
    isOwner: state.owner, profileUrl: '/u/' + encodeURIComponent(user.username),
    pageUrl: '/id/' + encodeURIComponent(code(user)),
  };
}

async function svg(card) {
  let qr = '';
  if (card.showQrCode) {
    const markup = await QRCode.toString(origin() + card.pageUrl, { type: 'svg', margin: 1 });
    const viewBox = markup.match(/viewBox="([^"]+)"/)[1];
    const inner = markup.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
    qr = `<svg x="735" y="170" width="190" height="190" viewBox="${viewBox}">${inner}</svg>`;
  }
  const nameSize = Math.min(40, 900 / Math.max(24, [...card.fullName].length));
  const statistics = card.level === null ? '' : `<text x="70" y="315" font-size="24">Level ${card.level} · ${esc(card.title)}</text><text x="70" y="355" font-size="21">${card.totalXp} XP</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="560" viewBox="0 0 1000 560" role="img" aria-label="Dev Harbour developer card">
    <rect width="1000" height="560" rx="32" fill="#f5f0fc"/>
    <rect x="24" y="24" width="952" height="512" rx="24" fill="white" stroke="#e2d5f0"/>
    <g font-family="Arial,Helvetica,sans-serif" fill="#30253f">
      <text x="70" y="91" font-size="22" font-weight="700" fill="#674299">DEV HARBOUR</text>
      <text x="70" y="129" font-size="16" fill="#766b85">DEVELOPER COMMUNITY CARD</text>
      <text x="70" y="209" font-size="${nameSize}" font-weight="700">${esc(card.fullName)}</text>
      <text x="70" y="252" font-size="25">@${esc(card.username)}</text>
      ${statistics}
      <text x="70" y="414" font-size="23" font-weight="700">${esc(card.developerId)}</text>
      ${card.memberSince ? `<text x="70" y="448" font-size="17" fill="#766b85">Member since ${esc(card.memberSince)}</text>` : ''}
      <text x="70" y="495" font-size="15" fill="#766b85">Community profile card · Not an official identity document</text>
    </g>${qr}
  </svg>`;
}

module.exports = { code, findUser, details, svg };
