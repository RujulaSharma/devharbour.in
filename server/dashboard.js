const db=require('./database');
async function details(userId){
 const pg=db.provider==='postgresql',p=pg?require('./prisma').getPrisma():null;
 const [history,projects,submissions,challenges]=await Promise.all([
  pg?p.xp_ledger.findMany({where:{user_id:userId},select:{amount:true,source_type:true,reference_id:true,note:true,created_at:true},orderBy:{created_at:'desc'},take:20000}):db.db.prepare('SELECT amount,source_type,reference_id,note,created_at FROM xp_ledger WHERE user_id=? ORDER BY created_at DESC LIMIT 20000').all(userId),
  pg?p.projects.findMany({where:{user_id:userId},select:{id:true,title:true,description:true,tech_stack_json:true,status:true,demo_url:true,repo_url:true}}):db.db.prepare('SELECT id,title,description,tech_stack_json,status,demo_url,repo_url FROM projects WHERE user_id=?').all(userId),
  pg?p.submissions.findMany({where:{user_id:userId,status:'passed'},select:{challenge_id:true}}):db.db.prepare("SELECT challenge_id FROM submissions WHERE user_id=? AND status='passed'").all(userId),
  db.getChallenges(),
 ]);
 const solved=new Set(submissions.map(s=>s.challenge_id));
 return {history,historyLimited:history.length===20000,projects,practice:{total:challenges.length,solved:solved.size,breakdown:['Easy','Medium','Hard'].map(difficulty=>({difficulty,count:challenges.filter(c=>c.difficulty.toLowerCase()===difficulty.toLowerCase()&&solved.has(c.id)).length})),categories:[...new Set(challenges.map(c=>c.category))]},dailyGoalSupported:false};
}
module.exports={details};
