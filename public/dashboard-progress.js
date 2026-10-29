/* Private dashboard: real progress and saved courses; no demo accounts or stats. */
(()=>{
 const root=document.getElementById('account-progress');if(!root)return;
 let controller,version=0,filter='continue',dialog;
 const node=(tag,text,parent=root)=>{const n=document.createElement(tag);if(text)n.textContent=text;parent.append(n);return n;};
 const button=(text,action,parent)=>{const b=node('button',text,parent);b.type='button';b.onclick=action;return b;};
 function renderLesson(content,text){
  content.replaceChildren();let code=null;
  for(const line of String(text||'').split('\n')){
   if(line.startsWith('```')){if(code)code=null;else code=node('pre','',content);continue;}
   if(code){code.textContent+=line+'\n';continue;}
   const heading=line.match(/^(#{1,3})\s+(.+)$/);
   if(heading)node('h'+Math.min(4,heading[1].length+1),heading[2],content);
   else if(line.trim())node('p',line,content);
  }
 }
 async function api(path,method='GET',body,signal=controller?.signal){const r=await fetch(path,{method,credentials:'same-origin',cache:'no-store',signal,headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw Error(data.error||'Request failed. Please retry.');return data;}
 function link(label,path,parent){const a=node('a',label,parent);a.href=path;return a;}
 async function lesson(course){
  if(!course.nextLesson)return;
  const request=version,userId=window.currentUser?.id;
  dialog?.remove();const modal=document.createElement('dialog');dialog=modal;modal.className='learning-reader';modal.setAttribute('aria-label','Course lesson');
  const top=node('div','',modal);top.className='learning-reader-top';node('h2',course.nextLesson.title,top);button('Close',()=>{modal.close();modal.remove();refresh();},top);
  const content=node('div','Loading lesson…',modal);content.className='lesson-content';document.body.append(modal);modal.showModal();
  try{const result=await api('/api/courses/lesson/'+encodeURIComponent(course.nextLesson.id));if(request!==version||window.currentUser?.id!==userId)return;renderLesson(content,result.lesson.content);
   await api('/api/courses/lesson/'+encodeURIComponent(course.nextLesson.id)+'/progress','POST',{readingSeconds:10});
   const message=node('p','',modal);message.setAttribute('role','status');
   const complete=button('Mark lesson complete',async()=>{complete.disabled=true;try{await api('/api/courses/lesson/'+encodeURIComponent(course.nextLesson.id)+'/complete','POST',{});if(window.currentUser?.id!==userId)return;modal.close();modal.remove();refresh();}catch(error){message.textContent=error.message;complete.disabled=false;}},modal);
  }catch(error){if(error.name!=='AbortError')content.textContent='This lesson could not be loaded. Close and try again.';}
 }
 function learning(parent,request,userId){
  const section=node('section','',parent);section.className='account-panel my-learning';section.id='my-learning';
  const heading=node('div','',section);heading.className='learning-heading';node('h3','My Learning',heading);node('p','Pick up where you left off and keep making progress.',heading);button('View All →',()=>{filter='explore';paint();},heading);
  const tabs=node('div','',section);tabs.className='learning-tabs';tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Filter your courses');
  const list=node('div','',section);list.className='learning-grid';let courses;
  const controls=[];
  const options=[['continue','In Progress'],['saved','Saved'],['completed','Completed']];
  function paint(){
   if(request!==version)return;list.replaceChildren();controls.forEach(([key,b])=>b.setAttribute('aria-pressed',String(filter===key)));
   if(!courses){node('p','Loading your learning library…',list);return;}
   const shown=courses.filter(c=>filter==='continue'?c.started&&c.completedLessons<c.totalLessons:filter==='saved'?c.saved:filter==='completed'?c.totalLessons>0&&c.completedLessons===c.totalLessons:true);
   if(!shown.length){const empty=node('div','',list);empty.className='learning-empty';node('h4',filter==='saved'?'Build your learning list':'Ready for your next skill?',empty);node('p',filter==='saved'?'Save a course from Explore More. It will stay in your account across devices.':'Start a course from Explore More. Your lessons and progress will appear here.',empty);button('Explore More',()=>{filter='explore';paint();},empty);return;}
   for(const course of shown){const card=node('article','',list);card.className='learning-course';
    node('span',course.category||'Learning',card).className='learning-category';node('h4',course.title,card);node('p',course.description||`${course.provider||'DevHarbour'} · ${course.level||'All levels'}`,card);if(course.durationHours)node('small',`${course.durationHours}h`,card);
    const progress=node('progress','',card);progress.max=Math.max(1,course.totalLessons);progress.value=course.completedLessons;progress.setAttribute('aria-label',course.title+' progress');
    node('p',`${course.completedLessons} / ${course.totalLessons} lessons completed`,card).className='learning-meta';
    const actions=node('div','',card);actions.className='learning-actions';
    if(course.nextLesson)button(course.started?'Continue course':'Start course',()=>lesson(course),actions);
    else node('span',course.totalLessons?'Course completed':'Lessons not yet available',actions);
    const save=button(course.saved?'Remove saved course':'Save course',async()=>{save.disabled=true;try{await api('/api/user/learning/'+encodeURIComponent(course.id)+'/save',course.saved?'DELETE':'POST',course.saved?undefined:{});if(request!==version||window.currentUser?.id!==userId)return;course.saved=!course.saved;paint();}catch(error){const msg=node('p',error.message,card);msg.setAttribute('role','alert');save.disabled=false;}},actions);
   }
  }
  for(const[key,label]of options){const b=button(label,()=>{filter=key;paint();},tabs);controls.push([key,b]);}
  paint();
  api('/api/user/learning').then(data=>{if(request!==version||window.currentUser?.id!==userId)return;courses=data.courses;paint();}).catch(error=>{if(request===version&&error.name!=='AbortError'){list.replaceChildren();node('p','Your learning library could not be loaded.',list);button('Retry',refresh,list);}});
 }
 async function refresh(){const request=++version;controller?.abort();controller=new AbortController();dialog?.close();dialog?.remove();root.replaceChildren();const user=window.currentUser;if(!user)return;
  const heading=node('div');heading.className='account-heading';const identity=node('div','',heading);identity.className='account-identity';node('span',(user.fullName||user.username||'D').charAt(0).toUpperCase(),identity).className='account-avatar';const intro=node('div','',identity);node('p','MY DEVHARBOUR',intro).className='account-eyebrow';node('h2',`Welcome back, ${user.fullName||user.username||'developer'}`,intro);node('p','A little progress every day adds up.',intro);
  const state=node('p','Loading your progress…');state.setAttribute('role','status');
  try{const data=await api('/api/user/summary');if(request!==version||window.currentUser?.id!==user.id)return;state.remove();
   const metrics=node('dl');metrics.className='account-metrics';for(const[label,key]of [['Total XP','totalXp'],['Level','level'],['Lessons completed','completedLessons'],['Challenges solved','solvedChallenges'],['Projects submitted','submittedProjects']]){const card=node('div','',metrics);node('dt',label,card);node('dd',String(Number(data.stats?.[key])||0),card);}
   const body=node('div');body.className='learning-layout';learning(body,request,user.id);const rail=node('aside','',body);rail.className='learning-rail';
   const streak=node('section','',rail);streak.className='account-panel';node('h3','Keep your momentum',streak);node('strong',`${Number(data.stats?.streakDays)||0} day streak`,streak).className='streak-value';node('p','Keep learning and practising to grow your streak.',streak);
   const activity=node('section','',rail);activity.className='account-panel';node('h3','Recent activity',activity);const history=Array.isArray(data.xpHistory)?data.xpHistory:[];if(!history.length)node('p','Your learning activity will appear here when you earn XP.',activity);else{const list=node('ul','',activity);list.className='account-activity';for(const entry of history.slice(0,5)){const item=node('li','',list);node('span',entry.note||String(entry.source_type||'Learning activity').replaceAll('_',' '),item);node('strong',`${Number(entry.amount)||0} XP`,item);}}
   const shortcuts=node('section','',rail);shortcuts.className='account-panel';node('h3','Your workspace',shortcuts);node('p','Turn learning into something you can build.',shortcuts);link('Open workspace','/workspace',shortcuts);link('Practise coding','/practice',shortcuts);
  }catch(error){if(error.name==='AbortError'||request!==version)return;state.textContent='We couldn’t load your progress. Your records have not changed.';button('Try again',refresh,root);}
 }
 root.addEventListener('click',event=>{const a=event.target.closest('a');if(!a||event.ctrlKey||event.metaKey||event.shiftKey)return;const routes={'/courses':'learn','/practice':'practice','/workspace':'work'};const view=routes[a.getAttribute('href')];if(view){event.preventDefault();window.goApp?.(view,a.getAttribute('href'));}});
 window.openSavedCourses=async()=>{filter='saved';await window.goApp?.('home');refresh();};
 window.addEventListener('dh:auth-changed',()=>{filter='continue';refresh();});window.addEventListener('dh:route-changed',()=>{if(location.pathname==='/dashboard')refresh();});refresh();
})();
