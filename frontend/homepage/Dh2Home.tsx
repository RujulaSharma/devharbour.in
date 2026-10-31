import TeamSection from './TeamSection';
import {useScrollReveals} from './useScrollReveals';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {useReducedMotion} from 'framer-motion';
import {Instagram,Linkedin,MessageCircle,Sun,Moon} from 'lucide-react';
import {handleNavigation,useHomepageData,type Project} from './platform';

const asset='/homepage/dh2/';
const social={community:'https://chat.whatsapp.com/Dt87L7lU5SOBSfKDKuNS8s',instagram:'https://www.instagram.com/devharbour.official',linkedin:'https://www.linkedin.com/company/devharbour/'};

export function useTheme(){
 const [theme,setTheme]=useState<'light'|'dark'>(()=>{
  if(typeof document!=='undefined'){
   const doc=document.documentElement.getAttribute('data-theme');
   if(doc==='dark'||doc==='light')return doc;
   try{
    const saved=localStorage.getItem('dh-theme');
    if(saved==='dark'||saved==='light')return saved;
   }catch{}
  }
  return 'light';
 });
 useEffect(()=>{
  const sync=()=>{
   const current=document.documentElement.getAttribute('data-theme');
   if(current==='dark'||current==='light')setTheme(current);
  };
  const observer=new MutationObserver(sync);
  observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  window.addEventListener('dh:theme-changed',sync);
  window.addEventListener('storage',sync);
  sync();
  return ()=>{
   observer.disconnect();
   window.removeEventListener('dh:theme-changed',sync);
   window.removeEventListener('storage',sync);
  };
 },[]);
 const toggle=()=>{
  const next=theme==='dark'?'light':'dark';
  setTheme(next);
  if(typeof window.setPlatformTheme==='function'){
   window.setPlatformTheme(next);
  }else{
   document.documentElement.setAttribute('data-theme',next);
   try{
    localStorage.setItem('dh-theme',next);
    localStorage.setItem('dh-theme-manual',next);
    localStorage.setItem('dh-theme-manual-time',String(Date.now()));
   }catch{}
   window.dispatchEvent(new CustomEvent('dh:theme-changed',{detail:{theme:next}}));
  }
 };
 return {theme,toggle};
}

function Brand(){return <span className="xlg"><img className="xli" src={asset+'logo.webp'} alt="" width="38" height="38"/>DEV HARBOUR</span>;}

function Header({theme,onToggleTheme}:{theme:'light'|'dark';onToggleTheme:()=>void}){
 const[user,setUser]=useState(window.currentUser);
 const header=useRef<HTMLElement>(null);
 useEffect(()=>{const sync=()=>setUser(window.currentUser);window.addEventListener('dh:auth-changed',sync);sync();return()=>window.removeEventListener('dh:auth-changed',sync);},[]);
 useEffect(()=>{
  const close=()=>header.current?.querySelectorAll('details[open]').forEach(detail=>detail.removeAttribute('open'));
  const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){const summary=header.current?.querySelector('details[open]>summary') as HTMLElement|null;close();summary?.focus();}};
  const outside=(event:PointerEvent)=>header.current?.querySelectorAll('details[open]').forEach(detail=>{if(!event.composedPath().includes(detail))detail.removeAttribute('open');});
  window.addEventListener('dh:route-changed',close);
  window.addEventListener('keydown',key);
  document.addEventListener('pointerdown',outside);
  return()=>{
   window.removeEventListener('dh:route-changed',close);
   window.removeEventListener('keydown',key);
   document.removeEventListener('pointerdown',outside);
  };
 },[]);
 const links=[['Ecosystem','/projects'],['Learn','/courses'],['Build','/workspace'],['Orca X Code','/hackathons']];
 return <header className="xn" ref={header}>
  <a href="/" aria-label="DevHarbour home"><Brand/></a>
  <nav className="xm" aria-label="Main navigation">{links.map(([name,path])=><a key={path} href={path}>{name}</a>)}</nav>
  <div className="xa">
   <button type="button" className="dh2-theme-toggle" aria-label={theme==='dark'?'Switch to light theme':'Switch to dark theme'} title={theme==='dark'?'Switch to light theme':'Switch to dark theme'} aria-pressed={theme==='dark'} onClick={onToggleTheme}>
    {theme==='dark'?<Sun size={17} aria-hidden="true"/>:<Moon size={17} aria-hidden="true"/>}
   </button>
   {user?<details className="dh2-account"><summary aria-label="Account options">{(user.fullName||user.username||'D').slice(0,1).toUpperCase()}</summary><nav aria-label="Account navigation"><strong>{user.fullName||user.username}</strong><button type="button" onClick={()=>window.openProfileModal?.()}>Profile</button><a href="/dashboard">Dashboard</a><a href="/settings">Settings</a><button type="button" onClick={()=>void window.openSavedCourses?.()}>Saved courses</button><a href="/certificate">My certificates</a><button type="button" onClick={onToggleTheme} className="dh2-menu-theme">{theme==='dark'?'☀ Switch to Light theme':'☾ Switch to Dark theme'}</button><button type="button" onClick={()=>window.handleLogout?.()}>Sign out</button></nav></details>:<button type="button" className="xa-btn xa-login" onClick={()=>window.openAuthModal?.('login')}>Log in</button>}
   <details className="dh2-mobile-nav"><summary>Menu</summary><nav aria-label="Mobile navigation">{links.map(([name,path])=><a key={path} href={path}>{name}</a>)}<button type="button" onClick={onToggleTheme} className="dh2-mobile-theme">{theme==='dark'?'☀ Switch to Light theme':'☾ Switch to Dark theme'}</button><a href="/resources">Learning guides</a><a href="/about">About</a><a href="/contact">Contact</a></nav></details>
  </div>
 </header>;
}

function Hero({theme,onToggleTheme}:{theme:'light'|'dark';onToggleTheme:()=>void}){
 const root=useRef<HTMLElement>(null),reduce=useReducedMotion(),[paused,setPaused]=useState(false);
 const still=!!reduce||paused;
 return <section ref={root} className={'hz'+(still?' dh2-still':'')} aria-label="Dev Harbour introduction" onPointerMove={event=>{if(still||event.pointerType!=='mouse')return;const bounds=event.currentTarget.getBoundingClientRect();root.current?.style.setProperty('--tilt-y',((event.clientX-bounds.left)/bounds.width-.5)*22+'deg');root.current?.style.setProperty('--tilt-x',-((event.clientY-bounds.top)/bounds.height-.5)*12+'deg');}} onPointerLeave={()=>{root.current?.style.setProperty('--tilt-y','0deg');root.current?.style.setProperty('--tilt-x','0deg');}}>
  <div className="xf"><Header theme={theme} onToggleTheme={onToggleTheme}/>
   <svg className="xc" viewBox="0 0 150 90" aria-hidden="true"><path d="M0 0Q6 40 50 45Q6 50 0 90Z" opacity=".55"/><path d="M50 0Q56 40 100 45Q56 50 50 90Z" opacity=".75"/><path d="M100 0Q106 40 150 45Q106 50 100 90Z"/></svg>
   <div className="xst"><div className="xt"><div className="xg"><div className="xfog"/><div className="xrg"/><div className="xrg b"/><img className="xk" src={asset+'sculpture.webp'} alt="" aria-hidden="true" width="640" height="640"/><img className="xi" src={asset+'sculpture.webp'} alt="Floating silver glass sculpture" width="640" height="640" fetchPriority="high"/></div><div className="xsh"/></div></div>
   <h1 className="xw">DEV HARBOUR<sup aria-hidden="true">®</sup></h1>
   <div className="xbm"><div className="xp"><b>+6</b><span>ways to learn, build<br/>and launch</span></div><p className="xb"><b>Learn.</b><b>Build.</b><b>Compete.</b></p><div className="xl"><a href={social.community} target="_blank" rel="noopener noreferrer">Community</a><s/><a href={social.instagram} target="_blank" rel="noopener noreferrer">Instagram</a><s/><a href={social.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a><s/><a href="/hackathons" className="hot">ORCAthon ↗</a></div><a className="xh" href="/courses">Explore the platform ↗</a></div>
  </div>
  <a className="sc" href="#featured">Scroll to explore</a><button className="dh2-motion" onClick={()=>setPaused(!paused)} disabled={!!reduce} aria-label={paused?'Resume hero motion':'Pause hero motion'} aria-pressed={paused}>{reduce?'Reduced motion':paused?'Resume motion':'Pause motion'}</button>
 </section>;
}

const headings=(first:string,last:string)=><h2 className="zh">{first} <strong>{last}</strong></h2>;
const publicUrl=(value:string)=>{try{const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.href:undefined;}catch{return undefined;}};

export default function Dh2Home(){
 useLayoutEffect(()=>{const boot=document.getElementById('dh-homepage-boot');if(boot)boot.hidden=true;},[]);
 useScrollReveals();
 const {theme,toggle}=useTheme();
 const data=useHomepageData(),[challenge,setChallenge]=useState(0),[challengeOpen,setChallengeOpen]=useState(false),page=useRef<HTMLElement>(null);
 const[period,setPeriod]=useState('All-time'),[weekly,setWeekly]=useState<typeof data.rankings>([]),[rankingMessage,setRankingMessage]=useState('');
 useEffect(()=>{if(period!=='Weekly'){setRankingMessage('');return;}const controller=new AbortController();setRankingMessage('Loading weekly rankings…');void fetch('/api/leaderboard?timeframe=Weekly&limit=50',{signal:controller.signal}).then(async response=>{if(!response.ok)throw Error();const result=await response.json();setWeekly(result.rankings);setRankingMessage('');}).catch(()=>{if(!controller.signal.aborted)setRankingMessage('Weekly rankings are temporarily unavailable.');});return()=>controller.abort();},[period]);
 const board=period==='Weekly'?weekly:data.rankings;
 const problems=[{title:'Two Sum',category:'Arrays',difficulty:'Easy',time:'15 min',desc:'Find two distinct numbers in an array whose sum equals a target.',steps:['Write down the input and expected output.','Compare a simple pair-by-pair solution with a map of previously seen values.','Check duplicates, negative values and an empty result.']},{title:'Valid Parentheses',category:'Stacks',difficulty:'Easy',time:'15 min',desc:'Check whether every opening bracket has a matching closing bracket in the correct order.',steps:['Track unmatched opening brackets in a stack.','Match each closing bracket with the top of the stack.','Test an empty string and incorrectly nested brackets.']}];
 const problem=problems[challenge];
 useEffect(()=>{const intro=document.getElementById('intro');if(!intro)return;let frame=0;const paint=()=>{frame=0;page.current?.style.setProperty('--dh2-progress',String(intro.scrollTop/Math.max(1,intro.scrollHeight-intro.clientHeight)));};const scroll=()=>{if(!frame)frame=requestAnimationFrame(paint);};intro.addEventListener('scroll',scroll,{passive:true});paint();return()=>{intro.removeEventListener('scroll',scroll);cancelAnimationFrame(frame);};},[]);
 const submittedProjects=data.projects.filter((project,index,all)=>project.id&&all.findIndex(p=>p.id===project.id)===index);
 const catalog:Project[]=(window.DHHomepage?.catalogProjects||[]).map((project,index)=>({id:'catalog-'+index,name:project.name,kind:project.description,stack:[project.category],heart:'',theme:'',label:project.name,symbol:'',url:publicUrl(project.demoUrl),repoUrl:publicUrl(project.repoUrl)}));
 const projects=submittedProjects.length?submittedProjects:data.errors.includes('projects')?[]:catalog;
 return <main id="dh2-homepage" data-theme={theme} className={'theme-'+theme} ref={page} onClick={handleNavigation}>
  <div className="dh2-reading" aria-hidden="true"/><Hero theme={theme} onToggleTheme={toggle}/>
  {data.errors.length>0&&<p className="dh2-notice" role="status">Some live {data.errors.join(', ')} information could not be loaded. You can still use the platform links. <button onClick={()=>location.reload()}>Retry</button></p>}
  <div id="landing">
   <section className="zs" id="featured">{headings('Ideas worth','exploring.')}<div className="fxg">{projects.map((project,index)=><article className={'fx'+(!index?' big':'')} key={project.id}>
    {!index&&<span className="fbd">✦ Featured project</span>}<div className="fsh" aria-label={project.name+' project preview'}><i/><i/><i/><span>Preview · {project.stack[0]||'Web'}</span></div>
    <h3>{project.name}</h3><p>{project.kind}</p><div className="zt">{project.stack.slice(0,4).map(tag=><span key={tag}>{tag}</span>)}</div><div className="fxa">{project.repoUrl&&<a className="zb o" href={project.repoUrl} target="_blank" rel="noopener noreferrer">GitHub ↗</a>}{project.url&&<a className="zb" href={project.url} target="_blank" rel="noopener noreferrer">Live demo ↗</a>}{!project.url&&!project.repoUrl&&<a className="zb o" href="/projects">Project gallery ↗</a>}</div>
   </article>)}</div>{!projects.length&&<div className="dh2-empty"><p>{data.errors.includes('projects')?'Projects are temporarily unavailable.':'Published community projects will appear here.'}</p><a className="zb o" href="/projects">Visit project gallery ↗</a></div>}<p className="zn">Student projects built, tested, and published on Dev Harbour.</p></section>
   <section className="zs" id="challenge">{headings('One challenge. A new','skill.')}<div className="zc"><div><p className="zn">Practice spotlight</p><dl className="zm"><div><dt>Category</dt><dd>{problem.category}</dd></div><div><dt>Difficulty</dt><dd>{problem.difficulty}</dd></div><div><dt>Estimated time</dt><dd>{problem.time}</dd></div></dl></div><div><h3>{problem.title}</h3><p>{problem.desc}</p><div className="zk"><button className="zb" aria-expanded={challengeOpen} aria-controls="dh2-challenge-details" onClick={()=>setChallengeOpen(!challengeOpen)}>Try Challenge</button><button className="zb o" onClick={()=>{setChallenge((challenge+1)%problems.length);setChallengeOpen(false);}}>Another challenge</button></div>{challengeOpen&&<div id="dh2-challenge-details" className="zbr"><p>Plan your solution</p><ol>{problem.steps.map(step=><li key={step}>{step}</li>)}</ol><a className="zb" href="/practice">Open practice ↗</a></div>}</div></div></section>
   <section className="zs" id="events">{headings('Build. Compete.','Win.')}<div className="hkc"><div className="hkh"><Brand/><b>Hackathons</b></div><article className="dh2-event"><div className="dh2-event-poster" aria-hidden="true">ORCA<br/>CODERS<br/><span>✦ 2026</span></div><div><span className="dh2-status">{data.hackathon.status}</span><h3>{data.hackathon.name}</h3><p>{data.hackathon.desc}</p><a className="zb" href="/hackathons">Event details ↗</a></div></article><p className="zn">Confirm dates, eligibility and participation details on the existing event page.</p></div><h3 className="zsub">More opportunities</h3>{[['Smart India Hackathon','National student innovation programme','Check current eligibility and event information on the official site.','https://www.sih.gov.in'],['MLH Global Hack Week','Online developer events','Explore current workshops and community challenges from Major League Hacking.','https://events.mlh.com'],['Devpost Hackathons','Rolling listings','Browse hackathons from companies and communities worldwide.','https://devpost.com/hackathons']].map(([name,format,description,url])=><div className="zo" key={name}><h4>{name}</h4><span>{format}</span><p>{description}</p><a className="zl" href={url} target="_blank" rel="noopener noreferrer">Details ↗</a></div>)}</section>
   <section className="zs" id="leaderboard">{headings('Climb the','leaderboard.')}<div className="lbx"><div className="lbh"><Brand/><div className="ltb" role="tablist" aria-label="Ranking period">{["Weekly","All-time"].map(value=><button key={value} role="tab" aria-selected={period===value} onClick={()=>setPeriod(value)}>{value}</button>)}</div></div>{rankingMessage&&<p role="status" className="zn dh2-after">{rankingMessage}</p>}<div className="pod">{board.slice(0,3).map((person,index)=><article className={'dh2-podium podium-'+index} key={person.userId}><span>{String(index+1).padStart(2,'0')}</span><h3>{person.fullName||person.username}</h3><b>{person.xp.toLocaleString()} XP</b><small>{person.challengesSolved} challenges</small></article>)}</div>{board.slice(3,8).map((person,index)=><div className="zlb" key={person.userId}><b>{String(index+4).padStart(2,'0')}</b><span>{person.fullName||person.username}</span><span>{person.challengesSolved}</span><span>{person.xp.toLocaleString()} XP</span></div>)}{!board.length&&<p className="dh2-empty">{data.errors.includes('rankings')?'Rankings are temporarily unavailable.':'No public rankings are available yet.'}</p>}<div className="lbf"><p className="zn">Developers ranked by recorded challenge and project XP.</p><a className="zb" href="/practice">Join the leaderboard</a></div></div></section>
   <section className="zs" id="learning">{headings('Curiosity, with','direction.')}<div className="zq">{data.roadmaps.slice(0,3).map(roadmap=><article key={roadmap.name}><h3>{roadmap.name}</h3><p>{roadmap.sub}</p><ol className="zst">{roadmap.nodes.map(node=><li key={node}>{node}</li>)}</ol><a className="zl" href="/roadmaps">Explore roadmap ↗</a></article>)}</div><p className="zn dh2-after">Find a path that fits your starting point.</p><details className="dh2-course-disclosure"><summary>Browse available courses ↗</summary><div className="dh2-course-list">{data.courses.slice(0,4).map(course=><a className="dh2-course" key={course.title} href={course.url}><span>{course.level}</span><h3>{course.title}</h3><p>{course.meta}</p><b>View course ↗</b></a>)}</div><a className="zb o" href="/courses">Browse all courses</a></details></section>
   <section className="zs" id="profiles">{headings('People building','what’s next.')}<div className="zpr">{data.rankings.slice(0,3).map(person=><article key={person.userId}><div className="zav" aria-hidden="true">{(person.fullName||person.username).slice(0,1).toUpperCase()}</div><h3>{person.fullName||person.username}</h3><p className="zn">@{person.username}</p><p className="zst2">{person.xp.toLocaleString()} XP · {person.challengesSolved} challenges solved</p><a className="zl" href="/community">Meet the community ↗</a></article>)}</div>{!data.rankings.length&&<p className="zn">Connect with developers through the community.</p>}</section>
   <section className="zs" id="community">{headings('Better','together.')}<div className="zm2"><div><h3>Meet the Community</h3><p>Pair up on a bug, review each other’s projects, and contribute to open ideas. Nobody builds alone here.</p><div className="zst3">{data.rankings.slice(0,5).map(person=><span className="zav" aria-hidden="true" key={person.userId}>{(person.fullName||person.username).slice(0,1)}</span>)}</div><a className="zl" href="/community">Visit the community ↗</a></div><div className="dh2-community-ranking"><div className="zlb h"><span>Rank</span><span>Developer</span><span>Challenges</span><span>Score</span></div>{data.rankings.slice(0,5).map((person,index)=><div className="zlb" key={person.userId}><b>{index+1}</b><span>{person.username}</span><span>{person.challengesSolved}</span><span>{person.xp.toLocaleString()} XP</span></div>)}{!data.rankings.length&&<p className="zn">Public rankings will appear here when activity is recorded.</p>}<p className="zn dh2-after">Public developer rankings from recorded activity.</p></div></div></section>
   <section className="zs" id="about">{headings('The team behind','the harbour.')}<p className="zn">Three co-founders. One mission: a place for students, developers and vibe coders to learn, build and grow.</p><TeamSection/><a className="zl" href="/about">More about Dev Harbour ↗</a></section>
   <section className="zs zcta">{headings('Your next big idea','starts here.')}<div className="zk"><a className="zb" href="/workspace">Start Building</a><a className="zb o" href="/hackathons">Explore Opportunities</a></div></section>
   <footer className="zft"><div className="zfi"><div><a href="/"><Brand/></a><p className="zn">A place for students, developers and vibe coders to learn, build, compete and grow.</p></div><nav aria-label="Footer navigation">{[['About','/about'],['Certificates','/certificate'],['Contact','/contact'],['Learning guides','/resources'],['Privacy','/privacy'],['Cookies','/cookies'],['Terms','/terms']].map(([name,path])=><a href={path} key={path}>{name}</a>)}</nav></div><div className="dh2-footer-socials"><a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={19}/></a><a href={social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={19}/></a><a href={social.community} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp community"><MessageCircle size={19}/></a></div><p className="zn zcp">© 2026 Dev Harbour · Learn. Build. Connect.</p></footer>
  </div>
 </main>;
}
