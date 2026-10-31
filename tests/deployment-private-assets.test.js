const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
test('bulk exports are excluded from deploy packages and routed away from the public CDN',()=>{
 const config=require('../vercel.json');
 for(const folder of ['certificates','downloads','output','standalone']){
  const url='/'+folder+'/private-export';
  const rule=config.rewrites.find(rule=>rule.source==='/'+folder+'/:path*');
  assert.ok(rule,`Missing CDN protection for ${url}`);
  assert.equal(rule.destination,'/api/private-assets-unavailable');
 }
 for(const name of ['.vercelignore','.dockerignore']){
  const ignored=fs.readFileSync(path.join(__dirname,'..',name),'utf8');
  for(const dir of ['public/certificates/','public/downloads/','output/','standalone/'])assert.ok(ignored.split(/\r?\n/).includes(dir),`${name} must exclude ${dir}`);
 }
});
