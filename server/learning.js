// Private learning overview reuses existing lesson progress and workspace bookmarks.
const db = require('./database');
async function overview(userId) {
  const [courses, workspace, lessons, progress] = await Promise.all([
    db.getCourses('All'), db.getWorkspaceData(userId),
    db.provider === 'postgresql' ? require('./prisma').getPrisma().lessons.findMany({ select: {id:true,course_id:true,title:true,order_index:true}, orderBy:{order_index:'asc'} }) : db.db.prepare('SELECT id,course_id,title,order_index FROM lessons ORDER BY order_index').all(),
    db.provider === 'postgresql' ? require('./prisma').getPrisma().lesson_progress.findMany({where:{user_id:userId},select:{lesson_id:true,status:true}}) : db.db.prepare('SELECT lesson_id,status FROM lesson_progress WHERE user_id=?').all(userId),
  ]);
  const states = new Map(progress.map(row => [row.lesson_id,row.status]));
  return {courses:courses.map(course=>{
    const items=lessons.filter(lesson=>lesson.course_id===course.id);
    const completed=items.filter(lesson=>states.get(lesson.id)==='completed').length;
    const next=items.find(lesson=>states.get(lesson.id)!=='completed');
    const bookmark=workspace.bookmarks.find(row=>row.item_type==='course'&&row.item_id===course.id);
    return {id:course.id,title:course.title,description:course.description,durationHours:course.duration_hours,provider:course.provider,category:course.category,level:course.level,
      totalLessons:items.length,completedLessons:completed,started:items.some(lesson=>states.has(lesson.id)),
      nextLesson:next?{id:next.id,title:next.title}:null,saved:!!bookmark};
  })};
}
module.exports={overview};
