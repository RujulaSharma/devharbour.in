const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '../public/index.html'), 'utf8');
const bootstrap = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const buttons = html.slice(html.indexOf('window.__renderGoogleButtons = function()'), html.indexOf('window.onGoogleCredentialResponse = async'));
function setup() {
  let resolveConfig;
  let initializedId;
  const calls = [];
  const meta = {content:''};
  const slot = {children:[],parentElement:{offsetWidth:360},style:{}};
  const fallback = {style:{}};
  const sdk = {initialize(config) { assert.ok(config.client_id); initializedId = config.client_id; calls.push('initialize'); },
    renderButton() { calls.push('render'); assert.ok(initializedId, 'Never render before client_id is configured'); },
    prompt() { assert.ok(initializedId); calls.push('prompt'); }};
  const context = {console,localStorage:{getItem:()=>null},toast:()=>{},fetch:()=>new Promise(r=>{resolveConfig=r;}),
    document:{getElementById:id=>({'google-gis-client-id':meta,'dh-google-btn-slot':slot,'dh-google-btn':fallback}[id]),
      createElement:()=>({}),head:{appendChild(){}},documentElement:{getAttribute:()=>'',classList:{contains:()=>false}}}};
  context.window = context;
  vm.createContext(context); vm.runInContext(bootstrap,context); vm.runInContext(buttons,context);
  return {context,sdk,calls,resolveConfig};
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
  const {context,sdk,calls,resolveConfig}=setup();context.google={accounts:{id:sdk}};
  resolveConfig({ok:true,json:async()=>({googleClientId:null})});await context.__googleConfigReady;
  context.__renderGoogleButtons();context.__triggerGoogleOneTap();await context.handleGoogleAuth();
  assert.deepEqual(calls,[]);
});
