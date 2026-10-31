const db=require('./database');
async function details(userId){
 const pg=db.provider==='postgresql',p=pg?require('./prisma').getPrisma():null;
 const [history,projects,submissions,challenges,workspace]=await Promise.all([
  pg?p.xp_ledger.findMany({where:{user_id:userId},select:{amount:true,source_type:true,reference_id:true,note:true,created_at:true},orderBy:{created_at:'desc'},take:20000}):db.db.prepare('SELECT amount,source_type,reference_id,note,created_at FROM xp_ledger WHERE user_id=? ORDER BY created_at DESC LIMIT 20000').all(userId),
  pg?p.projects.findMany({where:{user_id:userId},select:{id:true,title:true,description:true,tech_stack_json:true,status:true,demo_url:true,repo_url:true}}):db.db.prepare('SELECT id,title,description,tech_stack_json,status,demo_url,repo_url FROM projects WHERE user_id=?').all(userId),
  pg?p.submissions.findMany({where:{user_id:userId},select:{id:true,challenge_id:true,status:true,language:true,created_at:true}}):db.db.prepare("SELECT id,challenge_id,status,language,created_at FROM submissions WHERE user_id=?").all(userId),
  db.getChallenges(), db.getWorkspaceData(userId),
 ]);
 const solved=new Set(submissions.filter(s=>s.status==='passed').map(s=>s.challenge_id));
 return {history,historyLimited:history.length===20000,projects,workspace,submissions:submissions.map(s=>({...s,title:challenges.find(c=>c.id===s.challenge_id)?.title||'Challenge'})),practice:{total:challenges.length,solved:solved.size,breakdown:['Easy','Medium','Hard'].map(difficulty=>({difficulty,count:challenges.filter(c=>c.difficulty.toLowerCase()===difficulty.toLowerCase()&&solved.has(c.id)).length})),categories:[...new Set(challenges.map(c=>c.category))]},dailyGoalSupported:false};
}
module.exports={details};
