const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('public/index.html', 'utf8');
const uiCode = html.slice(html.indexOf('function updateAuthUI()'), html.indexOf('function openAuthModal('));
const sessionCode = html.slice(html.indexOf('async function handleLogout()'), html.indexOf('function getProjectLikes('));
const settle = () => new Promise(resolve => setImmediate(resolve));
const account = { id: 'test-owner', username: 'test_owner', fullName: 'Test Owner', totalXp: 25 };

function setup({ user = null, token = '', send = async () => new Response('{}', { status: 429 }), loading = false } = {}) {
  const storage = new Map();
  if (user) for (const key of ['dh_current_user', 'dh-current-user']) storage.set(key, JSON.stringify(user));
  if (token) for (const key of ['dh_token', 'dh-auth-token']) storage.set(key, token);
  const nodes = Object.fromEntries(['auth-header-btn', 'header-avatar', 'greet-name', 'navbar-xp'].map(id => [id, {}]));
  const label = {};
  const summary = { setAttribute() {} };
  const menu = { open: false, querySelector: () => summary };
  const listeners = {};
  const timers = new Map();
  const requests = [];
  const messages = [];
  let nextTimer = 0;
  const context = {
    currentUser: user, leaderboardViewerId: null, location: { protocol: 'https:', pathname: '/profile' },
    AbortSignal, console,
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
    document: {
      readyState: loading ? 'loading' : 'complete', hidden: false,
      getElementById: id => nodes[id] || null,
      querySelector: selector => selector.endsWith('.nav-account-label') ? label : menu,
      querySelectorAll: () => [],
      addEventListener(name, listener) { (listeners[name] ||= []).push(listener); }
    },
    setTimeout(callback, delay) { const id = ++nextTimer; timers.set(id, { callback, delay }); return id; },
    clearTimeout: id => timers.delete(id),
    updateNotificationBadge() {}, readPendingVerificationEmail: () => '',
    openAuthModal: tab => messages.push(tab || 'auth'), closeProfileModal() {},
    getAuthHeaders() { const value = storage.get('dh_token') || storage.get('dh-auth-token'); return value ? { Authorization: 'Bearer ' + value } : {}; },
    fetch: async (url, options) => { requests.push({ url, options }); return send(url, options); },
    __fetchAuth: send => send(), toast: message => messages.push(message), rl() {}
  };
  context.window = context;
  context.addEventListener = (name, listener) => { (listeners[name] ||= []).push(listener); };
  vm.createContext(context);
  vm.runInContext(uiCode + sessionCode, context);
  return { context, nodes, label, storage, timers, requests, messages, listeners };
}

test('guest login controls work before a session request completes or returns 429', async () => {
  let resolve;
  const fixture = setup({ send: () => new Promise(done => { resolve = done; }) });
  assert.equal(typeof fixture.nodes['auth-header-btn'].onclick, 'function');
  fixture.nodes['auth-header-btn'].onclick();
  assert.deepEqual(fixture.messages, ['auth']);
  resolve(new Response('{}', { status: 429 }));
  await settle();
  assert.equal(fixture.label.textContent, 'Sign in / Log in');
  assert.equal(typeof fixture.nodes['auth-header-btn'].onclick, 'function');
});

test('cached account controls remain available during temporary session failures', async () => {
  for (const status of [429, 503]) {
    const fixture = setup({ user: account, token: 'saved-session', send: async () => new Response('{}', { status }) });
    await settle();
    assert.equal(fixture.label.textContent, account.fullName);
    assert.equal(fixture.nodes['auth-header-btn'].hidden, true);
    assert.equal(fixture.storage.get('dh_token'), 'saved-session');
    assert.equal(fixture.context.currentUser.id, account.id);
  }
});

test('startup waits for the complete DOM before rendering account controls', async () => {
  const fixture = setup({ loading: true });
  assert.equal(fixture.requests.length, 0);
  assert.equal(fixture.nodes['auth-header-btn'].onclick, undefined);
  for (const listener of fixture.listeners.DOMContentLoaded || []) listener();
  assert.equal(typeof fixture.nodes['auth-header-btn'].onclick, 'function');
  await settle();
});

test('temporary session failures retry a bounded number of times and recover cookie-only accounts', async () => {
  let healthy = false;
  const fixture = setup({ send: async () => healthy ? Response.json({ user: account }) : new Response('{}', { status: 429, headers: { 'retry-after': '60' } }) });
  await settle();
  assert.equal(fixture.timers.size, 1);
  let timer = [...fixture.timers.values()][0];
  assert.ok(timer.delay >= 60000);
  fixture.timers.clear();
  timer.callback();
  await settle();
  timer = [...fixture.timers.values()][0];
  assert.ok(timer);
  healthy = true;
  fixture.timers.clear();
  timer.callback();
  await settle();
  assert.equal(fixture.context.currentUser.id, account.id);
  assert.equal(fixture.label.textContent, account.fullName);
  assert.equal(fixture.timers.size, 0);

  const unavailable = setup();
  for (let attempt = 0; attempt < 4; attempt++) {
    await settle();
    const pending = [...unavailable.timers.values()][0];
    unavailable.timers.clear();
    pending?.callback();
  }
  assert.equal(unavailable.requests.length, 3);
  assert.equal(unavailable.timers.size, 0);
});

test('an actual expired session clears cached identity only after cookie fallback also returns 401', async () => {
  const fixture = setup({ user: account, token: 'expired', send: async () => new Response('{}', { status: 401 }) });
  await settle();
  assert.equal(fixture.requests.length, 2);
  assert.equal(fixture.requests[1].options.credentials, 'include');
  assert.ok(fixture.requests[1].options.signal);
  assert.equal(fixture.context.currentUser, null);
  assert.equal(fixture.storage.get('dh_token'), undefined);
  assert.equal(fixture.timers.size, 0);
});

test('tab visibility changes and overlapping checks respect the active cooldown', async () => {
  let resolve;
  const fixture = setup({ send: () => new Promise(done => { resolve = done; }) });
  await fixture.context.checkAuthSession();
  assert.equal(fixture.requests.length, 1);
  resolve(new Response('{}', { status: 429, headers: { 'retry-after': '60' } }));
  await settle();
  for (const listener of fixture.listeners.visibilitychange || []) listener();
  await fixture.context.checkAuthSession();
  assert.equal(fixture.requests.length, 1);
  assert.equal(fixture.timers.size, 1);
});

test('a failed cookie fallback preserves the saved account and network failures keep login usable', async () => {
  let attempt = 0;
  const fixture = setup({ user: account, token: 'saved-session', send: async () => new Response('{}', { status: ++attempt === 1 ? 401 : 503 }) });
  await settle();
  assert.equal(fixture.context.currentUser.id, account.id);
  assert.equal(fixture.storage.get('dh_token'), 'saved-session');
  assert.equal(fixture.timers.size, 1);

  const offline = setup({ send: async () => { throw new TypeError('Failed to fetch'); } });
  await settle();
  assert.equal(typeof offline.nodes['auth-header-btn'].onclick, 'function');
  assert.equal(offline.timers.size, 1);
});

test('security challenges are not retried as backend wake-ups', async () => {
  const fixture = setup({ user: account, token: 'saved-session', send: async () => new Response('Challenge', { status: 429, headers: { 'cf-mitigated': 'challenge' } }) });
  await settle();
  assert.equal(fixture.timers.size, 0);
  await fixture.context.handleLogout();
  assert.match(fixture.messages.at(-1), /security check/i);
  assert.equal(fixture.storage.get('dh_token'), 'saved-session');
});

test('failed logout retains the session and explains a server failure accurately', async () => {
  const fixture = setup({ user: account, token: 'saved-session', send: async () => new Response('{}', { status: 429 }) });
  await settle();
  await fixture.context.handleLogout();
  assert.match(fixture.messages.at(-1), /busy|requests/i);
  assert.doesNotMatch(fixture.messages.at(-1), /check your connection/i);
  assert.equal(fixture.storage.get('dh_token'), 'saved-session');
  assert.equal(fixture.context.currentUser.id, account.id);
});

test('successful logout cannot be undone by an older session response or a scheduled retry', async () => {
  let resolveSession;
  const fixture = setup({ user: account, token: 'saved-session', send: url => url.endsWith('/logout') ? Response.json({ message: 'Signed out' }) : new Promise(resolve => { resolveSession = resolve; }) });
  await fixture.context.handleLogout();
  resolveSession(Response.json({ user: account }));
  await settle();
  assert.equal(fixture.context.currentUser, null);
  assert.equal(fixture.storage.get('dh_token'), undefined);
  assert.equal(fixture.timers.size, 0);
  assert.equal(fixture.messages.at(-1), 'Signed out.');
});

test('password login distinguishes service throttling and security checks from bad credentials', async () => {
  const code = html.slice(html.indexOf('let loginChallengeId'), html.indexOf('window.handleLogin = handleLogin;') + 'window.handleLogin = handleLogin;'.length);
  for (const [status, headers, message] of [
    [429, {}, /temporarily busy/i],
    [503, {}, /temporarily unavailable/i],
    [429, { 'cf-mitigated': 'challenge' }, /security check/i]
  ]) {
    const nodes = { 'li-user': { value: 'test_owner' }, 'li-pass': { value: 'test-password' }, 'li-msg': {}, 'li-submit': { disabled: false } };
    let requests = 0;
    const context = { AbortSignal, document: { getElementById: id => nodes[id] },
      __fetchAuth: send => send(), fetch: async (_url, options) => {
        requests++;
        assert.equal(options.credentials, 'include');
        assert.ok(options.signal);
        return new Response('Service unavailable', { status, headers });
      }
    };
    context.window = context;
    vm.createContext(context);
    vm.runInContext(code, context);
    context.handleLogin({ preventDefault() {} });
    context.handleLogin({ preventDefault() {} });
    await settle();
    assert.equal(requests, 1);
    assert.equal(nodes['li-submit'].disabled, false);
    assert.match(nodes['li-msg'].textContent, message);
    assert.doesNotMatch(nodes['li-msg'].textContent, /Invalid username or password/);
  }
});
