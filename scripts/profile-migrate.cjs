// No implicit use of the production runtime connection string.
require('dotenv').config({quiet:true});
if (!process.env.PROFILE_MIGRATION_URL || process.env.PROFILE_MIGRATION_APPROVED !== 'yes') {
  console.error('Migration refused. Review prisma/migrations first, set an explicit PROFILE_MIGRATION_URL and PROFILE_MIGRATION_APPROVED=yes.');
  process.exit(1);
}
const {spawnSync} = require('node:child_process');
const result=spawnSync(process.execPath,[require.resolve('prisma/build/index.js'),'migrate','deploy'],{stdio:'inherit',env:process.env});
if (result.error) {
  console.error('The migration process could not start.');
  process.exit(1);
}
process.exit(result.status ?? 1);
