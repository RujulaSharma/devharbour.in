const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
// Only isolated synthetic SQLite data; this suite never connects to Supabase.
process.env.NODE_ENV = 'test';
process.env.DB_PROVIDER = 'sqlite';
process.env.DB_PATH = path.join(fs.mkdtempSync(path.join(os.tmpdir(),'dh-public-pages-')), 'test.sqlite');
const {pages,buildPublicPages} = require('../scripts/public-pages');
buildPublicPages();
const app = require('../server/index');
const db = require('../server/database');
let server,base;
test.before(async()=>{await db.ready();server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));base='http://127.0.0.1:'+server.address().port;});
test.after(async()=>{await new Promise(resolve=>server.close(resolve));await db.close();});
test('public documents and all their internal links are accessible without a session', async()=>{
  const targets = new Set();
  for(const [slug,page] of Object.entries(pages)){
    const response=await fetch(base+'/'+slug);
    assert.equal(response.status,200,slug);
    const html=await response.text();
    assert.ok(html.includes(page.title));
    assert.ok(html.includes('<article>'));
    assert.ok(html.includes(`rel="canonical" href="https://devharbour.in/${slug}"`));
    assert.ok(!html.includes('adsbygoogle'));
    for(const [,url] of html.matchAll(/href="(\/[^"#]*)"/g))targets.add(url);
  }
  for(const target of targets){const response=await fetch(base+target);assert.equal(response.status,200,target);}
});
test('unknown pages and assets return a genuine 404 without breaking valid application routes',async()=>{
  for(const url of ['/does-not-exist','/guides/unknown','/assets/missing.png'])assert.equal((await fetch(base+url)).status,404,url);
  for(const url of ['/','/dashboard','/courses','/practice','/projects','/roadmaps','/hackathons','/community','/settings','/certificate','/certificate/verify/example'])assert.equal((await fetch(base+url)).status,200,url);
  assert.equal((await fetch(base+'/api/no-such-endpoint')).status,404);
});
test('crawler files include public documents and no private user resources',async()=>{
  const sitemap=await(await fetch(base+'/sitemap.xml')).text();
  for(const slug of Object.keys(pages))assert.ok(sitemap.includes('https://devharbour.in/'+slug));
  assert.ok(!sitemap.includes('/dashboard'));assert.ok(!sitemap.includes('/api/'));
  assert.ok((await(await fetch(base+'/robots.txt')).text()).includes('Sitemap: https://devharbour.in/sitemap.xml'));
});
test('Vercel public rewrites resolve every generated page',()=>{
  const rewrites=require('../vercel.json').rewrites;
  for(const slug of Object.keys(pages)){
    const rule=rewrites.find(row=>row.source.startsWith(slug.startsWith('guides/')?'/guides/:guide(':'/:page('));
    assert.ok(rule,slug);
    const name=slug.split('/').pop();assert.ok(rule.source.includes(name),slug);
    const destination=rule.destination.replace(/:(?:page|guide)/,name);
    assert.ok(fs.existsSync(path.join(__dirname,'..','public',destination)),destination);
  }
});
