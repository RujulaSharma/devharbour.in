/* Personal dashboard sections. Section URLs never accept another user's ID. */
(()=>{
 const sections={'Dashboard':'overview','My Courses':'courses','DSA Practice':'practice','Challenges':'challenges','Roadmaps':'roadmaps','Workspace':'workspace','My Projects':'projects','Project Gallery':'gallery','Hackathons':'hackathons','Community':'community','Certificates':'certificates','Settings':'settings'};
 let controller,version=0;
 const node=(tag,text,parent)=>{const n=document.createElement(tag);if(text)n.textContent=text;parent?.append(n);return n;};
 const button=(label,fn,parent)=>{const b=node('button',label,parent);b.type='button';b.onclick=fn;return b;};
 const catalog=(label,view,path,parent)=>button(label,()=>window.goApp?.(view,path),parent);
 async function sync(){
  restoreSettings();
  if(location.pathname!=='/dashboard'||!window.currentUser){delete document.body.dataset.personalSection;document.getElementById('personal-dashboard-section')?.remove();controller?.abort();return;}
  const section=new URLSearchParams(location.search).get('section')||'overview';
  const selected=Object.values(sections).includes(section)?section:'overview';
  document.body.dataset.personalSection=selected;
  document.querySelectorAll('.premium-sidebar a').forEach(a=>{const key=sections[a.querySelector('span')?.textContent];a.classList.toggle('active',key===selected);if(key===selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  document.body.classList.remove('dashboard-drawer');
  controller?.abort();controller=new AbortController();const request=++version;
  document.getElementById('personal-dashboard-section')?.remove();
  if(['overview','courses','certificates'].includes(selected))return;
  const panel=node('section',null,document.getElementById('v-home'));panel.id='personal-dashboard-section';panel.className='account-panel personal-section';
  const title={practice:'My DSA Progress',challenges:'My Challenge Submissions',roadmaps:'My Roadmaps',workspace:'My Workspace',projects:'My Submitted Projects',gallery:'My Project Gallery',hackathons:'My Hackathons',community:'My Community',settings:'My Account Settings'}[selected];node('h2',title,panel);
  if(selected==='settings'){const original=document.getElementById('account-settings');if(original){panel.append(original);return;}}
  const status=node('p','Loading your account data…',panel);
  try{const r=await fetch('/api/user/dashboard',{credentials:'same-origin',cache:'no-store',signal:controller.signal});if(!r.ok)throw Error();const data=await r.json();if(request!==version)return;status.remove();
   if(['projects','gallery'].includes(selected)){
    node('p','Only projects submitted by your signed-in account appear here.',panel);
    const list=node('div',null,panel);list.className='project-mini-grid';
    for(const project of data.projects){const card=node('article',null,list);node('h3',project.title,card);node('p',project.description,card);node('p','Status: '+project.status,card);let stack=[];try{stack=JSON.parse(project.tech_stack_json);}catch{}for(const tag of stack)node('span',tag,card).className='skill-tag';
     button('Open Project',()=>{const dialog=node('dialog',null,document.body);dialog.className='learning-reader';dialog.setAttribute('aria-label','Project '+project.id);node('h2',project.title,dialog);node('p',project.description,dialog);for(const[label,value]of[['Repository',project.repo_url],['Live Project',project.demo_url]])try{const url=new URL(value);if(['http:','https:'].includes(url.protocol)){const a=node('a',label,dialog);a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';}}catch{}button('Close',()=>{dialog.close();dialog.remove();},dialog);dialog.showModal();},card);
    }
    if(!data.projects.length)node('p','You haven’t submitted any projects yet.',panel);
    catalog('Build in Workspace','work','/workspace',panel);
   }else if(['practice','challenges'].includes(selected)){
    node('p',`${data.practice.solved} problems solved by you`,panel);
    for(const item of data.practice.breakdown)node('p',`${item.difficulty}: ${item.count} solved`,panel);
    const list=node('ul',null,panel);
    for(const submission of data.submissions||[]){const item=node('li',null,list);node('strong',submission.title,item);node('span',` — ${submission.status} · ${submission.language} · ${submission.created_at||''}`,item);}
    if(!data.submissions?.length)node('p','You haven’t submitted any solutions yet.',panel);
    catalog('Browse problems to practise','practice','/practice',panel);
   }else if(selected==='workspace'){
    for(const[key,label]of[['tasks','Your tasks'],['notes','Your notes'],['assignments','Your assignments'],['snippets','Your snippets'],['bookmarks','Your bookmarks']]){node('h3',label,panel);const list=node('ul',null,panel);const rows=data.workspace?.[key]||[];for(const row of rows)node('li',row.title||row.name||'Untitled',list);if(!rows.length)node('p','No saved items yet.',panel);}
    catalog('Manage your workspace','work','/workspace',panel);
   }else{
    const text={roadmaps:'Per-account roadmap tracking is not supported yet. Your recorded course progress is available in My Courses.',hackathons:'Your account does not have a personal hackathon registration history feature yet. This is not the public event catalog.',community:'Your account does not have community membership/activity tracking yet.'};
    node('p',text[selected]||'This account section is not available yet.',panel);
    const browse={roadmaps:['Browse roadmaps','learn','/roadmaps'],hackathons:['Explore public hackathons','hack','/hackathons'],community:['Explore the community','comm','/community']}[selected];if(browse)catalog(...browse,panel);
   }
  }catch(error){if(error.name!=='AbortError'&&request===version){status.textContent='Your account data could not be loaded.';button('Retry',sync,panel);}}
 }
 document.addEventListener('click',async event=>{
  const a=event.target.closest('.premium-sidebar a');if(!a||event.ctrlKey||event.metaKey||event.shiftKey)return;
  const section=sections[a.querySelector('span')?.textContent];if(!section)return;
  event.preventDefault();event.stopImmediatePropagation();
  const settings=document.getElementById('account-settings');if(settings&&document.getElementById('personal-dashboard-section')?.contains(settings))document.getElementById('v-settings')?.append(settings);
  await window.goApp?.('home','/dashboard'+(section==='overview'?'':'?section='+section));sync();window.scrollTo({top:0,behavior:'instant'});
 },true);
 document.querySelectorAll('.premium-sidebar a').forEach(a=>{const section=sections[a.querySelector('span')?.textContent];if(section){a.href='/dashboard'+(section==='overview'?'':'?section='+section);a.setAttribute('aria-label',a.querySelector('span').textContent);}});
 const settingsHome=document.getElementById('v-settings');
 function restoreSettings(){const settings=document.getElementById('account-settings');if(settings&&document.getElementById('personal-dashboard-section')?.contains(settings))settingsHome?.append(settings);}
 window.addEventListener('popstate',()=>{restoreSettings();setTimeout(sync,0);});
 window.addEventListener('dh:auth-changed',()=>{document.querySelectorAll('dialog.learning-reader').forEach(dialog=>{dialog.close();dialog.remove();});restoreSettings();sync();});
 window.addEventListener('dh:route-changed',()=>setTimeout(sync,0));
 const savedCourses=window.openSavedCourses;window.openSavedCourses=async()=>{await window.goApp?.('home','/dashboard?section=courses');await savedCourses?.();sync();};
 sync();
})();
