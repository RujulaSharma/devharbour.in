// Shared state transitions are synchronous; database locks serialize each account.
// No email network request runs inside a transaction.
function createStore(database = require('./database')) {
  if (database.provider === 'postgresql') {
    const { getPrisma } = require('./prisma');
    return {
      read: userId => getPrisma().email_verifications.findUnique({ where: { user_id: userId } }),
      mutate: (userId, change) => getPrisma().$transaction(async tx => {
        await tx.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;
        const old = await tx.email_verifications.findUnique({ where: { user_id: userId } });
        const { row, result } = change(old);
        if (row) await tx.email_verifications.upsert({ where: { user_id: userId }, create: row, update: row });
        return result;
      }, { maxWait: 15000, timeout: 20000 }),
    };
  }
  const sqlite = database.db;
  return {
    read: userId => sqlite.prepare('SELECT * FROM email_verifications WHERE user_id = ?').get(userId),
    mutate(userId, change) {
      sqlite.exec('BEGIN IMMEDIATE');
      try {
        const old = sqlite.prepare('SELECT * FROM email_verifications WHERE user_id = ?').get(userId);
        const { row, result } = change(old);
        if (row) {
          const keys = Object.keys(row);
          sqlite.prepare(`INSERT INTO email_verifications (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')}) ON CONFLICT(user_id) DO UPDATE SET ${keys.filter(k => k !== 'user_id').map(k => `${k}=excluded.${k}`).join(',')}`).run(...keys.map(k => row[k]));
        }
        sqlite.exec('COMMIT');
        return result;
      } catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    },
  };
}
module.exports = { createStore };
