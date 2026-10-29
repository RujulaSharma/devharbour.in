// Compare local private values with candidate Git files. Print no matched values.
const fs = require('node:fs'), cp = require('node:child_process');
const env = require('dotenv').parse(fs.readFileSync('.env'));
const git = args => cp.execFileSync('git', args, { encoding: 'utf8', windowsHide: true });
const tracked = git(['ls-files', '-z']).split('\0').filter(Boolean);
if (tracked.some(file => /^\.env(?:$|\.(?!example$))/.test(file) || file.startsWith('.local/'))) throw Error('Private settings file is tracked.');
const candidates = new Set([...git(['diff', '--name-only', '--diff-filter=ACMR', '-z']).split('\0'),
  ...git(['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z']).split('\0'),
  ...git(['ls-files', '--others', '--exclude-standard', '-z']).split('\0')].filter(Boolean));
const secrets = [];
for (const [key, value] of Object.entries(env)) {
  if (!value || !/(?:SECRET|PASSWORD|TOKEN|API_KEY|DATABASE_URL|DIRECT_URL|REDIS_URL)$/.test(key)) continue;
  if (value.length >= 12) secrets.push(value);
  try { const password = decodeURIComponent(new URL(value).password); if (password.length >= 12) secrets.push(password); } catch { /* Not a URL. */ }
}
let scanned = 0;
for (const file of candidates) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) continue;
  const content = fs.readFileSync(file, 'utf8');
  if (secrets.some(secret => content.includes(secret))) throw Error('A current local secret appears in candidate Git files. Review locally; no secret was printed.');
  scanned++;
}
console.log(`PASS: ${scanned} candidate files checked; current database, Redis, Resend and verification secrets were not found. Private environment/backup files are untracked.`);
