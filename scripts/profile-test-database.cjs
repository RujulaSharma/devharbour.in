// Creates a disposable local test database schema. Never accepts a non-loopback target.
process.env.NODE_ENV='test';process.env.DB_PATH=':memory:';process.env.REDIS_URL='';
const {Pool}=require('pg');const fs=require('node:fs');
const url=process.env.PROFILE_TEST_DATABASE_URL;
if(!url||!['localhost','127.0.0.1'].includes(new URL(url).hostname)||new URL(url).pathname!=='/profile_test')throw Error('Set a loopback PROFILE_TEST_DATABASE_URL ending in /profile_test.');
const pool=new Pool({connectionString:url});
(async()=>{try{
 const db=require('../server/db').db;
 const definitions=db.prepare("SELECT name,sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY rowid").all();
 for(const role of ['anon','authenticated','devharbour_runtime']){if(!(await pool.query('SELECT 1 FROM pg_roles WHERE rolname=$1',[role])).rowCount)await pool.query('CREATE ROLE '+role);}
 for(const d of definitions){let sql=d.sql.replace(/^CREATE TABLE (?!IF NOT EXISTS)/,'CREATE TABLE IF NOT EXISTS ').replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g,'SERIAL PRIMARY KEY').replace(/COLLATE NOCASE/g,'').replace(/\(datetime\('now'\)\)/g,"(CURRENT_TIMESTAMP::text)");await pool.query(sql);}
 // No production data is copied. Test records are inserted by the integration tests.
 const migration=fs.readFileSync('prisma/migrations/202611240001_developer_profiles/migration.sql','utf8');
 await pool.query('BEGIN');await pool.query(migration);await pool.query('COMMIT');
 console.log('Isolated PostgreSQL schema and additive profile migration applied.');
}catch(e){console.error(e.code,e.message);process.exitCode=1;}finally{await pool.end();}})();
