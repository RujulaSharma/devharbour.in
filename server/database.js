require('dotenv').config();
// Tests use isolated SQLite unless PostgreSQL is explicitly selected.
const provider = process.env.DB_PROVIDER || (process.env.NODE_ENV === 'test' ? 'sqlite' : 'postgresql');
if (provider === 'postgresql') {
  module.exports = require('./db-postgres');
} else if (provider === 'sqlite') {
  const legacy = require('./db');
  module.exports = {
    ...legacy, provider: 'sqlite', ready: async () => {}, close: async () => legacy.db.close(),
    getAchievements: () => legacy.db.prepare('SELECT * FROM achievements ORDER BY xp_bonus ASC').all(),
    getUserSummaryCounts: userId => ({
      completedLessons: legacy.db.prepare("SELECT COUNT(*) as count FROM lesson_progress WHERE user_id = ? AND status = 'completed'").get(userId).count,
      solvedChallenges: legacy.db.prepare("SELECT COUNT(DISTINCT challenge_id) as count FROM submissions WHERE user_id = ? AND status = 'passed'").get(userId).count,
      submittedProjects: legacy.db.prepare('SELECT COUNT(*) as count FROM projects WHERE user_id = ?').get(userId).count,
    }),
    getUserPublicProjects: userId => legacy.db.prepare("SELECT id, title, description, category, tech_stack_json, repo_url, demo_url, votes_count FROM projects WHERE user_id = ? AND status = 'approved'").all(userId).map(row => ({ ...row, techStack: JSON.parse(row.tech_stack_json || '[]') })),
  };
} else {
  throw new Error('DB_PROVIDER must be postgresql or sqlite.');
}
