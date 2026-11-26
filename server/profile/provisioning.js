const db = require('../db');
const { profilePrisma } = require('./prisma');
const { SECTIONS } = require('./validation');

function accountFields(user) {
  const links = {};
  for (const [key, value] of [['github', user.github_url], ['portfolio', user.portfolio_url]]) {
    if (!value) continue;
    try {
      const url = new URL(value.trim());
      if (['https:', 'http:'].includes(url.protocol) && !url.username && !url.password)
        links[key] = url.href;
    } catch {}
  }
  // Keep the original location intact; do not guess a city, state or country.
  return { city: user.location || '', links };
}

function withAccountFields(profile, user) {
  if (!user) return profile;
  const legacy = accountFields(user);
  return {
    ...profile,
    city: profile.city || (!profile.state && !profile.country ? legacy.city : ''),
    // An explicitly cleared link in the new profile takes precedence.
    links: { ...legacy.links, ...profile.links },
  };
}

async function insertMissingProfiles(users, client) {
  if (!users.length) return 0;
  let created = 0;
  const p = client || profilePrisma();
  const privacy = JSON.stringify(Object.fromEntries(SECTIONS.map(key => [key, 'private'])));
  const details = JSON.stringify({ showDeveloperId: true, showQrCode: true,
    allowResumeDownload: false, shareInProgressLearning: false });
  for (let offset = 0; offset < users.length; offset += 50) {
    const values = [];
    const tuples = users.slice(offset, offset + 50).map(user => {
      const fields = accountFields(user);
      const now = new Date().toISOString();
      const params = [user.id, fields.city, details, privacy, JSON.stringify(fields.links), 0, now, now];
      const placeholders = params.map(value => { values.push(value); return '$' + values.length; });
      return `(${placeholders.join(',')})`;
    });
    // Both databases provide defaults for private visibility, discovery and recruitment.
    // Conflicts leave every existing profile and its version/privacy/edits untouched.
    created += await p.$executeRawUnsafe(
      `INSERT INTO developer_profiles (user_id,city,details,privacy,links,version,created_at,updated_at)
       VALUES ${tuples.join(',')} ON CONFLICT (user_id) DO NOTHING`, ...values);
  }
  return created;
}

async function backfillProfiles({ apply = false } = {}) {
  const sql = `SELECT u.id,u.location,u.github_url,u.portfolio_url FROM users u
    LEFT JOIN developer_profiles p ON p.user_id=u.id WHERE p.user_id IS NULL ORDER BY u.id`;
  const users = db.isPostgres()
    ? (await require('../db-postgres').query(sql)).rows
    : db.db.prepare(sql).all();
  return { missing: users.length, created: apply ? await insertMissingProfiles(users) : 0 };
}

module.exports = { accountFields, withAccountFields, insertMissingProfiles, backfillProfiles };
