const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{execFileSync}=require('node:child_process');
for(const mode of ['development','test'])test('SQLite sample accounts are '+(mode==='test'?'limited to isolated tests':'not seeded during normal development'),()=>{
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'devharbour-seed-check-'));
  try{
    const source=`const db=require(${JSON.stringify(path.resolve('server/db.js'))});console.log(JSON.stringify({users:db.db.prepare('SELECT count(*) AS n FROM users').get().n}));db.db.close();`;
    const output=execFileSync(process.execPath,['-e',source],{env:{...process.env,NODE_ENV:mode,DB_PATH:path.join(directory,'test.sqlite')},encoding:'utf8',windowsHide:true});
    assert.equal(JSON.parse(output.trim()).users,mode==='test'?5:0);
  }finally{
    if(!path.resolve(directory).startsWith(path.resolve(os.tmpdir())+path.sep+'devharbour-seed-check-'))throw Error('Unsafe cleanup path');
    fs.rmSync(directory,{recursive:true,force:true});
  }
});
