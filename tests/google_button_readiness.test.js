const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '../public/index.html'), 'utf8');
const bootstrap = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const buttons = html.slice(html.indexOf('window.__renderGoogleButtons = function()'), html.indexOf('window.onGoogleCredentialResponse = async'));
function setup({ signedIn = false } = {}) {
  const scripts = [];
  let resolveConfig;
  let initializedId;
  const calls = [];
  const meta = {content:''};
  const slot = {children:[],parentElement:{offsetWidth:360},style:{},querySelector:()=>null};
  const fallback = {style:{}};
  const sdk = {initialize(config) { assert.ok(config.client_id); initializedId = config.client_id; calls.push('initialize'); },
    renderButton() { slot.children = [{}]; calls.push('render'); assert.ok(initializedId, 'Never render before client_id is configured'); },
    prompt() { assert.ok(initializedId); calls.push('prompt'); }};
  const context = {console,AbortSignal,setTimeout:()=>0,clearTimeout:()=>{},localStorage:{getItem:()=>signedIn ? 'session' : null},toast:()=>{},fetch:()=>new Promise(r=>{resolveConfig=r;}),
    document:{getElementById:id=>({'google-gis-client-id':meta,'dh-google-btn-slot':slot,'dh-google-btn':fallback}[id]),
      createElement:()=>({remove(){}}),head:{appendChild(script){scripts.push(script);}},documentElement:{getAttribute:()=>'',classList:{contains:()=>false}}}};
  context.window = context;
  vm.createContext(context); vm.runInContext(bootstrap,context); vm.runInContext(buttons,context);
  return {context,sdk,calls,scripts,slot,get resolveConfig() { return resolveConfig; }};
}
test('SDK arrives before config: opening login cannot render a button without client_id', async()=>{
  const {context,sdk,calls,resolveConfig}=setup();context.google={accounts:{id:sdk}};
  context.__renderGoogleButtons();assert.deepEqual(calls,[]);
  resolveConfig({ok:true,json:async()=>({googleClientId:'configured.apps.googleusercontent.com'})});
  await context.__googleConfigReady;
  assert.equal(calls[0],'initialize');assert.ok(calls.includes('render'));
  context.__initGIS();context.__renderGoogleButtons();
  assert.equal(calls.filter(x=>x==='initialize').length,1);
});
test('config arrives before SDK: no Google request is made until initialization succeeds', async()=>{
  const {context,sdk,calls,resolveConfig}=setup();
  resolveConfig({ok:true,json:async()=>({googleClientId:'configured.apps.googleusercontent.com'})});await context.__googleConfigReady;
  context.__renderGoogleButtons();assert.deepEqual(calls,[]);
  context.google={accounts:{id:sdk}};context.__initGIS();
  assert.equal(calls[0],'initialize');assert.ok(calls.includes('render'));
});
test('missing configuration never renders or prompts Google sign-in', async()=>{
  const fixture = setup();
  const {context,sdk,calls} = fixture;
  context.google = {accounts:{id:sdk}};
  fixture.resolveConfig({ok:true,json:async()=>({googleClientId:null})});
  await context.__googleConfigReady;
  context.__renderGoogleButtons();
  context.__triggerGoogleOneTap();
  const retry = context.handleGoogleAuth();
  fixture.resolveConfig({ok:true,json:async()=>({googleClientId:null})});
  await retry;
  assert.deepEqual(calls,[]);
});

test('signed-in participants can retry failed configuration and SDK loads', async () => {
  const fixture = setup({ signedIn: true });
  const { context, sdk, calls, scripts, slot } = fixture;
  fixture.resolveConfig({ ok: false, status: 429 });
  scripts[0].onerror();
  await context.__googleConfigReady;
  assert.deepEqual(calls, []);

  const retry = context.handleGoogleAuth();
  fixture.resolveConfig({ ok: true, json: async () => ({ googleClientId: 'configured.apps.googleusercontent.com' }) });
  assert.equal(scripts.length, 2);
  context.google = { accounts: { id: sdk } };
  scripts[1].onload();
  await retry;

  assert.equal(calls.filter(call => call === 'initialize').length, 1);
  assert.ok(calls.includes('render'));
  assert.ok(!calls.includes('prompt'));
  assert.equal(slot.style.display, 'flex');
});

test('auth retries only after Render explicitly rejects a cold-start request', async () => {
  const { context } = setup();
  let delay;
  let wake;
  const retryScheduled = Promise.withResolvers();
  context.setTimeout = (callback, milliseconds) => {
    delay = milliseconds;
    wake = callback;
    retryScheduled.resolve();
  };
  const sleeping = { status: 429, headers: new Headers({ 'x-render-routing': 'hibernate-rate-limited', 'retry-after': '50' }) };
  const success = { status: 201 };
  let attempts = 0;
  let showedWake = false;
  const pending = context.__fetchAuth(async () => ++attempts === 1 ? sleeping : success, () => { showedWake = true; });
  await retryScheduled.promise;
  assert.equal(attempts, 1);
  assert.equal(delay, 50000);
  assert.equal(showedWake, true);
  wake();
  assert.equal(await pending, success);
  assert.equal(attempts, 2);

  for (const response of [{ status: 502 }, { status: 429, headers: new Headers({ 'cf-mitigated': 'challenge' }) }]) {
    attempts = 0;
    assert.equal(await context.__fetchAuth(async () => { attempts++; return response; }), response);
    assert.equal(attempts, 1);
  }
});
