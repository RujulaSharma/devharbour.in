const db = require('../db');
const store = require('./store');
const progress = require('./progress');

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
    photoDataUrl: await require('./id-card-photo').forUser(user),
    showQrCode: state.profile.details?.showQrCode !== false,
    isOwner: state.owner, profileUrl: '/u/' + encodeURIComponent(user.username),
    pageUrl: '/id/' + encodeURIComponent(code(user)),
  };
}

const svg = (card, options) => require('./id-card-art').render(card, options);

module.exports = { code, findUser, details, svg };
