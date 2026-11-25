const express = require('express');
const push = require('web-push');
const {pool, awardXp} = require('../db-postgres');
const {requireAuth} = require('../auth');
const {rateLimit} = require('../rate-limiter');
const {indiaDay} = require('../study-rewards');

const router = express.Router();
const uuid = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i;
const active = "state='running' AND touched > now()-interval '120 seconds' AND elapsed+extract(epoch from now()-touched)<duration";
const open = "state IN ('running','paused')";
const points = {1500:15, 3000:30, 3600:36};

function fail(message, status=400) { throw Object.assign(new Error(message), {status}); }
function endpoint(fn) {
  return async (req,res) => {
    res.set('Cache-Control','private, no-store');
    try {
      if (!pool) fail('Live study is temporarily unavailable.',503);
      res.json(await fn(req));
    } catch (e) {
      const status = e.status || (e.code === '23505' ? 409 : 503);
      if (status === 503) console.error('[study]', e.code || e.name);
      res.status(status).json({error:e.status ? e.message : 'Could not sync study activity. Please retry.'});
    }
  };
}
async function transaction(user, work) {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    await c.query("select pg_advisory_xact_lock(hashtext('study:' || $1))",[user]);
    const result = await work(c);
    await c.query('COMMIT');
    return result;
  } catch(e) { await c.query('ROLLBACK'); throw e; }
  finally { c.release(); }
}
const first = async (client,sql,params) => (await client.query(sql,params)).rows[0];
router.get('/count',endpoint(req => first(pool,`SELECT count(*)::int AS active FROM study_together.sessions WHERE ${active}`)));
router.use(requireAuth);
router.post(/.*/,rateLimit({max:55}));
router.get('/state',endpoint(async req => {
  const id=req.user.id;
  const [session, group, totals, count, history, admin] = await Promise.all([
    first(pool,`SELECT * FROM study_together.sessions WHERE user_id=$1 AND ${open}`,[id]),
    first(pool,`SELECT g.id,g.name,g.owner_id=$1 AS owner,CASE WHEN g.owner_id=$1 THEN g.invite END AS invite,m.muted,m.visible
      FROM study_together.members m JOIN study_together.groups g ON g.id=m.group_id WHERE m.user_id=$1`,[id]),
    first(pool,`WITH days AS (SELECT (ended AT TIME ZONE 'Asia/Kolkata')::date AS day, sum(elapsed) AS seconds
      FROM study_together.sessions WHERE user_id=$1 AND state='finished' GROUP BY 1),
      numbered AS (SELECT day,day+row_number() over(order by day desc)::int AS chain FROM days)
      SELECT coalesce((SELECT seconds FROM days WHERE day=(now() AT TIME ZONE 'Asia/Kolkata')::date),0)::int AS seconds,
      (SELECT count(*)::int FROM numbered WHERE chain=(SELECT chain FROM numbered WHERE day >= (now() AT TIME ZONE 'Asia/Kolkata')::date-1 ORDER BY day DESC LIMIT 1)) AS streak`,[id]),
    first(pool,`SELECT count(*)::int AS active FROM study_together.sessions WHERE ${active}`),
    pool.query("SELECT subject,ended,floor(elapsed/60)::int AS minutes FROM study_together.sessions WHERE user_id=$1 AND state='finished' ORDER BY ended DESC LIMIT 5",[id]),
    req.user.role==='admin' ? first(pool,`SELECT count(DISTINCT user_id) FILTER(WHERE started>=(date_trunc('day',now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata'))::int AS today,
      count(DISTINCT user_id)::int AS week FROM study_together.sessions WHERE started>=now()-interval '7 days'`) : null
  ]);
  if(group) {
    group.members=(await pool.query(`SELECT u.id,u.username,
      CASE WHEN m.visible AND s.id IS NOT NULL AND (${active}) THEN 'Studying'
           WHEN m.visible AND s.state='paused' AND s.touched>now()-interval '2 hours' THEN 'On break' ELSE 'Offline' END AS status,
      CASE WHEN m.visible AND (${active}) THEN floor((s.elapsed+extract(epoch from now()-s.touched))/60)::int END AS minutes
      FROM study_together.members m JOIN public.users u ON u.id=m.user_id
      LEFT JOIN study_together.sessions s ON s.user_id=u.id AND ${open}
      WHERE m.group_id=$1 AND EXISTS(SELECT 1 FROM study_together.members me WHERE me.user_id=$2 AND me.group_id=m.group_id)
      ORDER BY u.username`,[group.id,id])).rows;
    group.starts=(await pool.query(`SELECT e.session_id,u.username,e.created FROM study_together.starts e
      JOIN study_together.sessions s ON s.id=e.session_id JOIN public.users u ON u.id=s.user_id
      JOIN study_together.members sender ON sender.user_id=u.id AND sender.group_id=e.group_id AND sender.visible
      JOIN study_together.members me ON me.user_id=$2 AND me.group_id=e.group_id AND NOT me.muted
      WHERE e.group_id=$1 AND u.id<>$2 AND e.created>now()-interval '45 seconds'`,[group.id,id])).rows;
  }
  const pending=await first(pool,"SELECT id FROM study_together.sessions WHERE user_id=$1 AND state='finished' AND duration IN (1500,3000,3600) AND elapsed>=duration AND NOT reward_settled ORDER BY ended LIMIT 1",[id]);
  return {pending:pending?.id,session:session || null,group:group || null,totals,history:history.rows,admin,...count,now:Date.now()};
}));
router.post('/group',endpoint(req => transaction(req.user.id,async c => {
  const id=req.user.id, {action,name,invite,member,value}=req.body;
  const mine=await first(c,'SELECT g.* FROM study_together.groups g JOIN study_together.members m ON m.group_id=g.id WHERE m.user_id=$1 FOR UPDATE OF g',[id]);
  if(action==='create' || action==='join'){
    if(mine) fail('Leave your current group first.',409);
    let group;
    if(action==='create'){
      if(typeof name!=='string'||!name.trim()||name.trim().length>60) fail('Choose a group name up to 60 characters.');
      group=await first(c,'INSERT INTO study_together.groups(name,owner_id) VALUES($1,$2) RETURNING id',[name.trim(),id]);
    }else{
      if(!uuid.test(invite)) fail('Invalid invite.');
      group=await first(c,'SELECT id FROM study_together.groups WHERE invite=$1 FOR UPDATE',[invite]);
      if(!group) fail('This invite has expired.',404);
      const size=await first(c,'SELECT count(*)::int AS n FROM study_together.members WHERE group_id=$1',[group.id]);
      if(size.n>=50) fail('This group is full.',409);
    }
    await c.query('INSERT INTO study_together.members(user_id,group_id) VALUES($1,$2)',[id,group.id]);
  }else{
    if(!mine) fail('Join a group first.',404);
    if(action==='mute'||action==='visibility'){
      if(typeof value!=='boolean') fail('Invalid preference.');
      await c.query('UPDATE study_together.members SET '+(action==='mute'?'muted':'visible')+'=$2 WHERE user_id=$1',[id,value]);
    }else if(action==='leave'){
      await c.query('DELETE FROM study_together.members WHERE user_id=$1',[id]);
      if(mine.owner_id===id){
        const next=await first(c,'SELECT user_id FROM study_together.members WHERE group_id=$1 ORDER BY user_id LIMIT 1',[mine.id]);
        if(next) await c.query('UPDATE study_together.groups SET owner_id=$2,invite=gen_random_uuid() WHERE id=$1',[mine.id,next.user_id]);
        else await c.query('DELETE FROM study_together.groups WHERE id=$1',[mine.id]);
      }
    }else if(mine.owner_id===id && action==='rotate'){
      await c.query('UPDATE study_together.groups SET invite=gen_random_uuid() WHERE id=$1',[mine.id]);
    }else if(mine.owner_id===id && action==='remove' && typeof member==='string' && member!==id){
      await c.query('DELETE FROM study_together.members WHERE group_id=$1 AND user_id=$2',[mine.id,member]);
      await c.query('UPDATE study_together.groups SET invite=gen_random_uuid() WHERE id=$1',[mine.id]);
    }else fail('Action unavailable.',403);
  }
  return {ok:true};
})));
router.post('/timer',endpoint(async req=>{
  const user=req.user.id, {action,id,duration}=req.body;
  const result=await transaction(user,async c=>{
    if(action==='start'){
      const subject=req.body.subject || '';
      if(typeof subject!=='string'||subject.length>80) fail('Use a shorter subject.');
      if(!Number.isInteger(duration)||duration<60||duration>10800) fail('Choose 1–180 minutes.');
      const existing=await first(c,`SELECT * FROM study_together.sessions WHERE user_id=$1 AND ${open}`,[user]);
      if(existing) return {session:existing};
      const session=await first(c,"INSERT INTO study_together.sessions(user_id,duration,state,subject) VALUES($1,$2,'running',$3) RETURNING *",[user,duration,subject.trim()]);
      const event=await first(c,'INSERT INTO study_together.starts(session_id,group_id) SELECT $1,group_id FROM study_together.members WHERE user_id=$2 AND visible RETURNING group_id',[session.id,user]);
      return {session,event};
    }
    if(!uuid.test(id)||!['pulse','pause','resume','cancel','finish'].includes(action)) fail('Invalid timer action.');
    const s=await first(c,'SELECT *,extract(epoch from now()-touched)::float8 AS gap FROM study_together.sessions WHERE id=$1 AND user_id=$2 FOR UPDATE',[id,user]);
    if(!s) fail('Session unavailable.',404);
    if(['finished','cancelled'].includes(s.state)) return {session:s};
    let elapsed=s.elapsed;
    if(s.state==='running') elapsed=Math.min(s.duration,elapsed+Math.min(120,Math.max(0,s.gap)));
    let state=s.state;
    if(action==='cancel') state='cancelled';
    else if(action==='finish' && elapsed<60) fail('Finish after at least one focus minute, or reset the timer.');
    else if(action==='finish'||elapsed>=s.duration) state='finished';
    else if(action==='resume') state='running';
    else if(action==='pause'||s.gap>120) state='paused';
    if(s.state==='paused' && state==='paused') return {session:s};
    return {session:await first(c,`UPDATE study_together.sessions SET state=$2,elapsed=$3,touched=now(),
      ended=CASE WHEN $2 IN ('finished','cancelled') THEN now() END WHERE id=$1 RETURNING *`,[id,state,elapsed])};
  });
  if(result.event) notifyGroup(user, result.event.group_id,result.session.id).catch(e=>console.error('[study push]',e.name));
  const s=result.session;
  const reward=!s.reward_settled && s.state==='finished' && s.elapsed>=s.duration && points[s.duration] ? await awardXp(user,points[s.duration],'streak_bonus','focus:'+indiaDay(new Date(s.ended).getTime()),'Completed a study timer session') : null;
  if(reward) await pool.query('UPDATE study_together.sessions SET reward_settled=true WHERE id=$1',[s.id]);
  return {session:s,reward,now:Date.now()};
}));
let cachedKeys;
async function pushKeys(){
  if(cachedKeys) return cachedKeys;
  let row=await first(pool,'SELECT keys FROM study_together.push_keys WHERE singleton');
  if(!row){
    row=await first(pool,'INSERT INTO study_together.push_keys VALUES(true,$1) ON CONFLICT(singleton) DO UPDATE SET singleton=true RETURNING keys',[JSON.stringify(push.generateVAPIDKeys())]);
  }
  cachedKeys=row.keys;
  return cachedKeys;
}
router.get('/push-key',endpoint(async()=>({key:(await pushKeys()).publicKey})));
router.post('/push',endpoint(async req=>{
  const sub=req.body.subscription;
  let url;
  try{url=new URL(sub.endpoint);}catch{fail('Invalid subscription.');}
  if(url.protocol!=='https:'||url.port||url.username||url.password||!['fcm.googleapis.com','updates.push.services.mozilla.com','web.push.apple.com','notify.windows.com'].some(h=>url.hostname===h||url.hostname.endsWith('.'+h))) fail('Unsupported push service.');
  if(!/^[\w-]{87}$/.test(sub.keys?.p256dh)||!/^[-\w]{22}$/.test(sub.keys?.auth)||sub.endpoint.length>2048) fail('Invalid push keys.');
  await pool.query('INSERT INTO study_together.subscriptions VALUES($1,$2,$3) ON CONFLICT(endpoint) DO UPDATE SET user_id=excluded.user_id,subscription=excluded.subscription',[url.href,req.user.id,JSON.stringify({endpoint:url.href,keys:sub.keys})]);
  return {ok:true};
}));
async function notifyGroup(user,group,id){
  const rows=(await pool.query(`SELECT s.subscription FROM study_together.subscriptions s JOIN study_together.members m ON m.user_id=s.user_id
    WHERE m.group_id=$1 AND m.user_id<>$2 AND NOT m.muted`,[group,user])).rows;
  if(!rows.length)return;
  const keys=await pushKeys();
  await Promise.all(rows.map(async ({subscription})=>{
    try{await push.sendNotification(subscription,JSON.stringify({id}),{TTL:45,timeout:5000,vapidDetails:{subject:'https://devharbour.in',...keys}});}
    catch(e){if([404,410].includes(e.statusCode)) await pool.query('DELETE FROM study_together.subscriptions WHERE endpoint=$1',[subscription.endpoint]);}
  }));
}
module.exports=router;
