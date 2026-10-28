// Explicit opt-in: creates and cleans up only this run's test records.
const { spawnSync } = require('node:child_process');
const result = spawnSync(process.execPath, ['--test', 'tests/api.test.js', 'tests/certificates.test.js', 'tests/postgres.test.js'], {
  env: { ...process.env, NODE_ENV: 'test', DB_PROVIDER: 'postgresql' },
  stdio: 'inherit',
});
process.exitCode = result.status || (result.error ? 1 : 0);
