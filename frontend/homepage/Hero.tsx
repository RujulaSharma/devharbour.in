import {useState,useEffect} from 'react';
import {motion,useMotionValue,useSpring,useReducedMotion} from 'framer-motion';
import {ArrowUpRight,Pause,Play,Instagram,Linkedin,MessageCircle} from 'lucide-react';
import {Pill,SectionTag} from './ui';
import HeroArtwork from './HeroArtwork';
export default function Hero(){
 const reduce=useReducedMotion();const [paused,setPaused]=useState(false);
 const x=useMotionValue(0),y=useMotionValue(0);const rx=useSpring(y,{stiffness:80,damping:22}),ry=useSpring(x,{stiffness:80,damping:22});
 const still=!!reduce||paused;
 const scroll=useMotionValue(0),drift=useSpring(scroll,{stiffness:65,damping:25});
 useEffect(()=>{
  const intro=document.getElementById('intro');if(!intro)return;
  const update=()=>scroll.set(still?0:-Math.min(45,intro.scrollTop*.08));
  intro.addEventListener('scroll',update,{passive:true});update();
  return()=>intro.removeEventListener('scroll',update);
 },[scroll,still]);
 return <section className="hero hero-sculpture" aria-label="DevHarbour highlights">
  <div className="hero-content">
   <motion.div className="sculpture-copy" initial={reduce?false:{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.8}}>
    <SectionTag>A SPACE FOR YOUR NEXT CHAPTER</SectionTag>
    <h1>Good ideas<br/>deserve <em>to<br className="desktop-break"/> be built.</em></h1>
    <div className="hero-manifesto"><span>Learn.</span><span>Build.</span><span>Connect.</span></div>
    <p>Learn a new skill. Build something you’re proud of.<br/>Connect with people who are figuring it out, too.</p>
    <div className="hero-buttons"><Pill href="#join">Find your starting point</Pill><a className="sculpture-secondary" href="/projects">See what people are building <ArrowUpRight size={16}/></a></div>
    <nav className="hero-socials" aria-label="DevHarbour social communities">
      <a href="https://www.instagram.com/devharbour.official" target="_blank" rel="noopener noreferrer"><Instagram size={17}/><span>Instagram</span><ArrowUpRight size={12}/></a>
      <a href="https://www.linkedin.com/company/devharbour/" target="_blank" rel="noopener noreferrer"><Linkedin size={17}/><span>LinkedIn</span><ArrowUpRight size={12}/></a>
      <a href="https://chat.whatsapp.com/Dt87L7lU5SOBSfKDKuNS8s" target="_blank" rel="noopener noreferrer"><MessageCircle size={17}/><span>WhatsApp Community</span><ArrowUpRight size={12}/></a>
    </nav>
   </motion.div>
  </div>
  <div className="sculpture-stage">
   <motion.div className={'hero-art harbour-art '+(still?'is-still':'')} style={{rotateX:still?0:rx,rotateY:still?0:ry,y:still?0:drift,transformPerspective:1400}}
    onPointerMove={e=>{if(still||e.pointerType!=='mouse')return;const r=e.currentTarget.getBoundingClientRect();x.set(((e.clientX-r.left)/r.width-.5)*9);y.set(-((e.clientY-r.top)/r.height-.5)*7);}}
    onPointerLeave={()=>{x.set(0);y.set(0);}}><HeroArtwork/><div className="harbour-brand"><strong>DevHarbour</strong><span>LEARN / BUILD / CONNECT</span></div></motion.div>
   <div className="art-caption"><span>THE HARBOUR / IDEAS IN MOTION</span><button type="button" onClick={()=>setPaused(!paused)} disabled={!!reduce} aria-label={paused?'Resume hero motion':'Pause hero motion'} aria-pressed={paused}>{paused||reduce?<Play size={12}/>:<Pause size={12}/>}<span>{reduce?'Reduced motion':paused?'Resume motion':'Pause motion'}</span></button></div>
  </div>
  <a href="#hackathons" className="hero-discover">SCROLL TO FIND YOUR NEXT THING <span>↓</span></a>
 </section>;
}
