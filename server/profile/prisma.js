let client;
function profilePrisma() {
  if (client) return client;
  const { pool } = require("../db-postgres");
  if (!pool)
    throw Object.assign(new Error("Profile database is not configured."), {
      status: 503,
    });
  const { PrismaPg } = require("@prisma/adapter-pg");
  const { PrismaClient } = require("../generated/profile-client");
  // Reuse the application's pool, including its trusted CA and TLS checks.
  client = new PrismaClient({
    adapter: new PrismaPg(pool),
    transactionOptions: { maxWait: 5000, timeout: 10000 },
  });
  return client;
}
module.exports = { profilePrisma };
