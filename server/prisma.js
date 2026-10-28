// Server-only Prisma client shared by the PostgreSQL repositories.
require('dotenv').config();
const { PrismaPg } = require('@prisma/adapter-pg');

function connectionUrl(variable = 'DATABASE_URL') {
  const value = process.env[variable];
  let parsed;
  try { parsed = new URL(value); } catch {
    throw new Error(`Set ${variable} to a PostgreSQL URI in your local .env file.`);
  }
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol) ||
      !parsed.hostname || !parsed.username || !parsed.password ||
      /\[|\]|YOUR-|PROJECT-REF|PASSWORD/.test(value)) {
    throw new Error(`Complete ${variable} in your local .env file.`);
  }
  if (variable === 'DIRECT_URL' && parsed.port === '6543') {
    throw new Error('DIRECT_URL must use the direct or session connection, not transaction pooler port 6543.');
  }
  return value;
}

function createPrisma(variable = 'DATABASE_URL') {
  const url = connectionUrl(variable);
  const { PrismaClient } = require('../generated/prisma');
  const adapter = new PrismaPg({
    connectionString: url,
    max: 5,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    statement_timeout: 15000,
  });
  const client = new PrismaClient({ adapter, log: [] });
  return require('./course-cache-prisma').withCourseInvalidation(client,
    () => require('./course-cache').courseCache.invalidate());
}

let client;
function getPrisma() {
  if (!client) client = createPrisma();
  return client;
}

module.exports = { connectionUrl, createPrisma, getPrisma };
