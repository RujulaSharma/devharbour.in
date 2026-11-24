(() => {
  const panel=document.getElementById('study-together');
  if(!panel)return;
  if(location.protocol==='file:'){panel.hidden=true;return;}
  const byId=id=>document.getElementById('study-'+id);
  const text=(id,value)=>{const el=byId(id);if(el.textContent!==value) el.textContent=value;};
  const message=value=>text('message',value);
  let account,group=null,session=null,busy=false,reading=false,revision=0,offset=0,lastPulse=0;
  let seen=new Set(), rosterKey='', established=false;
  const invite=new URLSearchParams(location.hash.slice(1)).get('study-invite') || new URLSearchParams(location.search).get('study-invite');
  if(invite && /^[\da-f-]{36}$/i.test(invite)) byId('invite').value=invite;
  function showGroupForm(joining){
    byId('create').hidden=joining;
    byId('join').hidden=!joining;
    byId('show-create').setAttribute('aria-pressed',String(!joining));
    byId('show-join').setAttribute('aria-pressed',String(joining));
  }
  byId('show-create').onclick=()=>showGroupForm(false);
  byId('show-join').onclick=()=>showGroupForm(true);
  showGroupForm(Boolean(byId('invite').value));
  async function api(path,body) {
    const res=await fetch('/api/study/'+path,{method:body?'POST':'GET',headers:getAuthHeaders(),credentials:'same-origin',
      body:body?JSON.stringify(body):undefined,cache:'no-store'});
    const data=await res.json();
    if(!res.ok) throw Error(data.error||'Study Together is unavailable.');
    return data;
  }
  function syncAccount(){
    const id=typeof currentUser==='undefined'?null:currentUser?.id;
    if(account!==id){
      account=id;revision++;session=null;group=null;rosterKey='';established=false;seen.clear();
      byId('subject').value='';byId('subject').disabled=false;byId('finish').hidden=true;byId('history').replaceChildren();byId('admin').hidden=true;
      byId('members').replaceChildren();text('progress','');message('');byId('group').hidden=true;
      document.dispatchEvent(new CustomEvent('study-clock',{detail:null}));
    }
    byId('signed').hidden=!id;
    byId('guest').hidden=!!id;
    return id;
  }
  function drawClock(){
    if(!session) return;
    const age=Math.max(0,(Date.now()+offset-Date.parse(session.touched))/1000);
    const spent=session.elapsed+(session.state==='running'?Math.min(120,age):0);
    const remaining=Math.max(0,Math.ceil(session.duration-spent));
    document.dispatchEvent(new CustomEvent('study-clock',{detail:{...session,remaining}}));
    if(session.state==='running' && (!remaining || Date.now()-lastPulse>28000) && !busy && Date.now()-lastPulse>2000) timer('pulse');
  }
  function setSession(data){
    offset=data.now-Date.now();
    session=data.session;
    if(session && ['finished','cancelled'].includes(session.state))session=null;
    byId('finish').hidden=!session;
    byId('subject').disabled=!!session;
    if(session)byId('subject').value=session.subject||'';
    if(session)drawClock();
    else document.dispatchEvent(new CustomEvent('study-clock',{detail:null}));
  }
  function renderGroup(g){
    group=g;
    byId('entry').hidden=!!g;byId('group').hidden=!g;
    if(!g){established=false;rosterKey='';return;}
    text('name',g.name);byId('owner').hidden=!g.owner;
    byId('mute').checked=g.muted;byId('visible').checked=g.visible;
    const key=JSON.stringify(g.members)+g.owner;
    if(key!==rosterKey){
      const list=document.createDocumentFragment();
      for(const m of g.members){
        const li=document.createElement('li'),label=document.createElement('strong'),status=document.createElement('span');
        label.textContent=m.username;status.textContent=m.status+(m.status==='Studying'?' · '+m.minutes+'m':'');
        li.append(label,status);
        if(g.owner && m.id!==account){
          const btn=document.createElement('button');btn.type='button';btn.textContent='Remove';
          btn.onclick=()=>groupAction({action:'remove',member:m.id});li.append(btn);
        }
        list.append(li);
      }
      byId('members').replaceChildren(list);rosterKey=key;
    }
    const recent=new Set();
    for(const s of g.starts){
      recent.add(s.session_id);
      if(established && !seen.has(s.session_id)){
        const note=s.username+' started studying in '+g.name+'.';
        message(note);if(typeof toast==='function')toast(note);
      }
    }
    established=true;seen=recent;
  }
  async function refresh(){
    const id=syncAccount();
    if(reading||busy||(!id && !panel.getClientRects().length))return;
    reading=true;const version=revision;
    try{
      const data=await api(id?'state':'count');
      if(syncAccount()!==id||version!==revision)return;
      text('count',data.active+' active '+(data.active===1?'timer':'timers'));
      if(!id)return;
      setSession(data);renderGroup(data.group);
      if(data.pending){
        const settled=await api('timer',{action:'pulse',id:data.pending});
        if(syncAccount()===id)showStudyReward(settled.reward);
      }
      byId('admin').hidden=!data.admin;
      if(data.admin)text('admin',data.admin.today+' started today · '+data.admin.week+' in the last seven days');
      const history=(data.history||[]).map(item=>(item.subject||'Focus session')+' · '+item.minutes+'m · '+new Date(item.ended).toLocaleDateString());
      const items=(history.length?history:['No completed sessions yet.']).map(label=>{const li=document.createElement('li');li.textContent=label;return li;});
      byId('history').replaceChildren(...items);
      text('progress',Math.floor(data.totals.seconds/60)+' focused minutes today · '+data.totals.streak+' day streak');
    }catch(e){message(e.message);text('count','Live count unavailable');}
    finally{reading=false;}
  }
  async function timer(action,duration){
    const user=syncAccount();
    if(!user||busy)return;
    if(action!=='start'&&!session)return;
    busy=true;revision++;lastPulse=Date.now();
    try{
      const data=await api('timer',{action,duration,id:session?.id,subject:byId('subject').value});
      if(syncAccount()!==user)return;
      setSession(data);
      if(data.session.state==='finished'){
        showStudyReward(data.reward);
        message('Focus session saved.');
        document.dispatchEvent(new CustomEvent('study-finished',{detail:data.session.elapsed}));
      }
    }catch(e){message(e.message);}
    finally{busy=false;if(action!=='pulse'||!session)refresh();}
  }
  window.studyTogether={timer,get session(){return session;}};
  async function groupAction(body){
    if(busy)return;busy=true;revision++;
    const buttons=[...byId('entry').querySelectorAll('button')];
    buttons.forEach(button=>{button.disabled=true;});
    if(body.action==='create'||body.action==='join')message(body.action==='create'?'Creating group…':'Joining group…');
    try{await api('group',body);message('');}
    catch(e){message(e.message);}
    finally{busy=false;buttons.forEach(button=>{button.disabled=false;});refresh();}
  }
  byId('create').onsubmit=e=>{e.preventDefault();groupAction({action:'create',name:byId('new-name').value});};
  byId('join').onsubmit=e=>{
    e.preventDefault();let code=byId('invite').value.trim();
    if(code.includes('study-invite='))code=code.split('study-invite=').pop().split('&')[0];
    groupAction({action:'join',invite:code});
  };
  byId('finish').onclick=()=>timer('finish');
  byId('leave').onclick=()=>groupAction({action:'leave'});
  byId('rotate').onclick=()=>groupAction({action:'rotate'});
  byId('copy').onclick=async()=>{
    const link=location.origin+'/timer?study-invite='+group.invite;
    try{await navigator.clipboard.writeText(link);message('Invite link copied.');}catch{message(link);}
  };
  byId('mute').onchange=e=>groupAction({action:'mute',value:e.target.checked});
  byId('visible').onchange=e=>groupAction({action:'visibility',value:e.target.checked});
  byId('focus').onclick=()=>{
    document.getElementById('dh-mode-countdown-btn').click();
    if(!session)timer('start',1500);else if(session.state==='paused')timer('resume');
  };
  byId('push').hidden=!('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window);
  byId('push').onclick=async()=>{
    try{
      if(await Notification.requestPermission()!=='granted')return message('Notifications are disabled in your browser.');
      await navigator.serviceWorker.register('/study-worker.js',{scope:'/'});
      const reg=await navigator.serviceWorker.ready;
      const {key}=await api('push-key');
      const bytes=Uint8Array.from(atob(key.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
      const sub=await reg.pushManager.getSubscription() || await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:bytes});
      await api('push',{subscription:sub.toJSON()});message('Browser notifications enabled.');
    }catch(e){message(e.message);}
  };
  setInterval(()=>{syncAccount();drawClock();},1000);
  setInterval(()=>{if(!document.hidden)refresh();},15000);
  new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting))refresh();}).observe(panel);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
  window.addEventListener('online',refresh);
  refresh();
})();
