const { createSqlitePrismaAdapter } = require("./prisma-sqlite");

let pgClient;
let sqliteClient;

function profilePrisma() {
  const db = require("../db");
  const { pool } = require("../db-postgres");
  if (db.isPostgres()) {
    if (pgClient) return pgClient;
    if (!pool)
      throw Object.assign(new Error("Profile database is not configured."), {
        status: 503,
      });
    const { PrismaPg } = require("@prisma/adapter-pg");
    const { PrismaClient } = require("../generated/profile-client");
    // Reuse the application's pool, including its trusted CA and TLS checks.
    pgClient = new PrismaClient({
      adapter: new PrismaPg(pool),
      transactionOptions: { maxWait: 5000, timeout: 10000 },
    });
    return pgClient;
  }
  if (process.env.NODE_ENV === "production" && !pool) {
    throw Object.assign(new Error("Profile database is not configured."), {
      status: 503,
    });
  }
  if (!sqliteClient) {
    sqliteClient = createSqlitePrismaAdapter(() => {
      if (!db.db) {
        throw Object.assign(new Error("Profile database is not configured."), {
          status: 503,
        });
      }
      return db.db;
    });
  }
  return sqliteClient;
}
module.exports = { profilePrisma };
