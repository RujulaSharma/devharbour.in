const { spawnSync } = require('node:child_process');
const result = spawnSync(process.execPath, ['--test', 'tests/redis.test.js'], {
  env: { ...process.env, NODE_ENV: 'test', RUN_REDIS_TESTS: 'true' }, stdio: 'inherit',
});
process.exitCode = result.status ?? 1;
