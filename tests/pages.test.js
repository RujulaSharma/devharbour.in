const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('node:vm');

test('Terms, Privacy, Contact, About pages and Pro Footer Integrity', () => {
  const publicHtml = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
  const rootHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  // 1. Root index.html must be identical to public/index.html
  assert.equal(rootHtml.length, publicHtml.length, 'Root index.html and public/index.html length must match');
  assert.equal(rootHtml, publicHtml, 'Root index.html must be strictly identical to public/index.html');

  // 2. All 4 views must exist
  assert.ok(publicHtml.includes('id="v-about"'), 'v-about view must exist');
  assert.ok(publicHtml.includes('id="v-contact"'), 'v-contact view must exist');
  assert.ok(publicHtml.includes('id="v-terms"'), 'v-terms view must exist');
  assert.ok(publicHtml.includes('id="v-privacy"'), 'v-privacy view must exist');

  // 3. Professional footer must exist
  assert.ok(publicHtml.includes('class="dh-pro-footer"'), 'dh-pro-footer must exist');
  assert.ok(publicHtml.includes('All Systems Operational'), 'Status indicator must exist');
  const footer = publicHtml.match(/<footer\b[\s\S]*?<\/footer>/)?.[0] || '';
  for (const route of ['about', 'contact', 'terms', 'privacy']) {
    assert.ok(footer.includes(`href="/${route}/"`), `${route} link in footer must exist`);
    assert.ok(fs.existsSync(path.join(__dirname, '..', 'public', route, 'index.html')), `${route} public page must exist`);
  }

  // 4. Contact form must exist
  assert.ok(publicHtml.includes('id="dh-contact-form"'), 'dh-contact-form must exist');
  assert.ok(publicHtml.includes('submitContactForm'), 'submitContactForm handler must exist');

  // 5. URL and Routing handlers must exist
  assert.ok(publicHtml.includes('initAppRouting'), 'initAppRouting route handler must exist');

  // 6. Passcode patterns must remain completely eradicated
  assert.ok(!publicHtml.includes('dh-cert-lock-modal'), 'No passcode modal allowed');
  assert.ok(!publicHtml.includes('verifyCertPasscode'), 'No passcode verify function allowed');
  assert.ok(!publicHtml.includes('dh_cert_unlocked'), 'No passcode storage allowed');
});

test('certificate claims can be retried after a stalled or rate-limited response', { timeout: 1000 }, async () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
  const start = html.indexOf('async function loadMyCertificateView(');
  const end = html.indexOf('\nfunction ', start);
  const button = { disabled: false };
  const attributes = new Map();
  const form = {
    querySelector: () => button,
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: name => attributes.delete(name)
  };
  const elements = new Map([['mycert-claim', form]]);
  const document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, { removeAttribute() {} });
      return elements.get(id);
    }
  };
  let expire;
  let attempts = 0;
  const bodyRead = Promise.withResolvers();
  const context = vm.createContext({
    AbortController,
    document,
    location: { protocol: 'https:' },
    certificateClaimEmail: 'participant@example.com',
    currentUser: { email: 'participant@example.com' },
    getAuthHeaders: () => ({ Authorization: 'Bearer test-session' }),
    myCertificateRequest: undefined,
    setTimeout(callback, delay) {
      assert.equal(delay, 15000);
      expire = callback;
    },
    clearTimeout() { expire = undefined; },
    async fetch(_url, { signal }) {
      attempts += 1;
      if (attempts === 1) {
        return { json: () => new Promise((_, reject) => {
          signal.addEventListener('abort', () => reject(signal.reason), { once: true });
          bodyRead.resolve();
        }) };
      }
      if (attempts === 2) return { status: 429 };
      return { ok: true, json: async () => ({ eligible: false, message: 'No eligible registration.' }) };
    }
  });
  const checkRegistration = vm.runInContext(html.slice(start, end) + '\nloadMyCertificateView', context);
  const firstClaim = checkRegistration();
  await bodyRead.promise;
  assert.equal(attributes.get('aria-busy'), 'true');
  assert.equal(button.disabled, true);
  expire();
  await firstClaim;
  assert.match(elements.get('mycert-message').textContent, /took too long.*try again/i);
  assert.equal(attributes.has('aria-busy'), false);
  assert.equal(button.disabled, false);

  await checkRegistration();
  assert.match(elements.get('mycert-message').textContent, /service is busy.*try again/i);
  assert.equal(button.disabled, false);

  await checkRegistration();
  assert.equal(elements.get('mycert-message').textContent, 'No eligible registration.');
  assert.equal(button.disabled, false);
  assert.equal(expire, undefined);
});
