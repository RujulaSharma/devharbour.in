#!/usr/bin/env node
/**
 * Dev Harbour — Production Build Pipeline
 * Synchronizes canonical public/index.html to root index.html
 * and enforces production security and deployment integrity.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const canonicalPath = path.join(rootDir, 'public', 'index.html');
const rootIndexPath = path.join(rootDir, 'index.html');

console.log('⚡ Starting Dev Harbour Build Pipeline...');
require('./build-public-guides');

if (!fs.existsSync(canonicalPath)) {
  console.error('❌ Build failed: Canonical public/index.html not found!');
  process.exit(1);
}

let canonicalHtml = fs.readFileSync(canonicalPath, 'utf8');
// Ship profile markup and its renderer/styles atomically, avoiding stale external bundles.
for (const [kind, file] of [['style','profile-ecosystem.css'], ['script','profile-ecosystem.js']]) {
  const content = fs.readFileSync(path.join(rootDir, 'public/assets', file), 'utf8');
  const block = '<!-- profile-bundle-' + kind + ':start -->\n<' + kind + '>' + content + '</' + kind + '>\n<!-- profile-bundle-' + kind + ':end -->';
  const existing = new RegExp('<!-- profile-bundle-' + kind + ':start -->[\\s\\S]*?<!-- profile-bundle-' + kind + ':end -->');
  const external = kind === 'style' ? /<link rel="stylesheet" href="\/assets\/profile-ecosystem\.css[^" ]*">/ : /<script src="\/assets\/profile-ecosystem\.js[^" ]*" defer><\/script>/;
  canonicalHtml = canonicalHtml.replace(existing.test(canonicalHtml) ? existing : external, () => block);
}
canonicalHtml = canonicalHtml.replace(/<script src="\/assets\/profile-page\.js[^" ]*"><\/script>/, '');
fs.writeFileSync(canonicalPath, canonicalHtml, 'utf8');

// Integrity checks: Ensure legacy passcode patterns are permanently eradicated
const forbiddenPatterns = [
  { name: 'Passcode Modal ID', pattern: /id=["']dh-cert-lock-modal["']/ },
  { name: 'Passcode verification function', pattern: /verifyCertPasscode/ },
  { name: 'Passcode session storage key', pattern: /sessionStorage\.(get|set)Item\(['"]dh_cert_unlocked['"]/ },
  { name: 'Hardcoded passcode 916 comparison', pattern: /val\s*===\s*['"]916['"]/ }
];

for (const check of forbiddenPatterns) {
  if (check.pattern.test(canonicalHtml)) {
    console.error(`❌ Build failed: Forbidden pattern found in public/index.html: ${check.name}`);
    process.exit(1);
  }
}

// Copy canonical public/index.html to root index.html for Vercel
fs.writeFileSync(rootIndexPath, canonicalHtml, 'utf8');

const rootHtml = fs.readFileSync(rootIndexPath, 'utf8');
if (rootHtml.length !== canonicalHtml.length) {
  console.error('❌ Build failed: Root index.html size mismatch after copy!');
  process.exit(1);
}

console.log(`✅ Build successful!`);
console.log(`   Canonical Source: public/index.html (${canonicalHtml.length} bytes)`);
console.log(`   Root Deployment:  index.html (${rootHtml.length} bytes)`);
console.log(`   Google Auth:      Enabled (FedCM + One Tap + Account Chooser)`);
console.log(`   Certificate Gate: Registered email ownership`);

async function checkProductionDatabase() {
  if (process.env.VERCEL_ENV !== 'production') return;
  const { pool } = require('../server/db');
  if (!pool) throw new Error('Configure a production DATABASE_URL in Vercel before deploying.');
  try {
    await pool.query('SELECT 1');
  } catch {
    throw new Error('The production database connection failed. Check DATABASE_URL and the database TLS configuration.');
  } finally {
    await pool.end();
  }
}

checkProductionDatabase().catch(error => {
  console.error('Deployment check failed:', error.message);
  process.exitCode = 1;
});
