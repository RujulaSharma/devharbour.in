// Add only the private OTP hashing key. Preserve all existing settings and values.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const dotenv = require('dotenv');
const root = path.resolve(__dirname, '..');
const file = path.join(root, '.env');
const contents = fs.readFileSync(file, 'utf8');
const values = dotenv.parse(contents);
if (values.EMAIL_VERIFICATION_SECRET) {
  if (!/^[a-f0-9]{64,}$/i.test(values.EMAIL_VERIFICATION_SECRET)) throw Error('Existing EMAIL_VERIFICATION_SECRET is invalid; review locally without sharing it.');
  console.log('Existing email verification secret preserved.');
} else {
  const directory = path.join(root, '.local'); fs.mkdirSync(directory, { recursive: true });
  const backup = path.join(directory, `.env-before-email-verification-${Date.now()}`);
  fs.copyFileSync(file, backup, fs.constants.COPYFILE_EXCL);
  if (process.platform === 'win32') {
    const quote = value => "'" + value.replaceAll("'", "''") + "'";
    require('node:child_process').execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
      `Get-Acl -LiteralPath ${quote(file)} | Set-Acl -LiteralPath ${quote(backup)}`], { windowsHide: true, stdio: 'ignore' });
  } else fs.chmodSync(backup, 0o600);
  const line = `EMAIL_VERIFICATION_SECRET="${crypto.randomBytes(32).toString('hex')}"`;
  const updated = /^EMAIL_VERIFICATION_SECRET\s*=/m.test(contents)
    ? contents.replace(/^EMAIL_VERIFICATION_SECRET\s*=.*$/m, line)
    : contents + '\n# Private email verification HMAC key\n' + line + '\n';
  fs.writeFileSync(file, updated);
  console.log('Private verification secret generated in ignored .env; existing settings backed up and preserved.');
}
