import {useState} from 'react';
import {motion,useReducedMotion} from 'framer-motion';
import ParticleOrb,{type Mode} from './ParticleOrb';
const appear={hidden:{opacity:0,y:27},visible:{opacity:1,y:0}};
export default function Hero(){
 const [mode,setMode]=useState<Mode>('orb'),[paused,setPaused]=useState(false);
 const reduce=useReducedMotion(),still=!!reduce||paused;
 const discover=()=>{const root=document.getElementById('dh-homepage')?.shadowRoot;root?.getElementById('hackathons')?.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});};
 return <section className="hero particle-hero" id="home" aria-label="DevHarbour highlights">
  <div className="hero-grid" aria-hidden="true"/>
  <div className="hero-layout">
   <div className="hero-content">
    <motion.div className="eyebrow" initial={reduce?false:'hidden'} animate="visible" variants={appear} transition={{delay:.18}}>✦ &nbsp; A PLACE FOR THE NEXT GENERATION OF BUILDERS</motion.div>
    <motion.h1 initial={reduce?false:'hidden'} animate="visible" variants={appear} transition={{delay:.3,duration:.8}}>Build what<br/>you <em>imagine.</em></motion.h1>
    <motion.p className="hero-description" initial={reduce?false:'hidden'} animate="visible" variants={appear} transition={{delay:.48,duration:.7}}>Learn new skills. Create meaningful projects. Explore opportunities. Build your future with DevHarbour.</motion.p>
    <motion.div className="hero-actions" initial={reduce?false:'hidden'} animate="visible" variants={appear} transition={{delay:.65}}>
     <motion.button whileHover={reduce?{}:{y:-3,scale:1.025}} whileTap={reduce?{}:{scale:.96}} className="button-primary" onClick={discover}>Start Building <span>↗</span></motion.button>
     <motion.button whileHover={reduce?{}:{y:-3}} whileTap={reduce?{}:{scale:.97}} className="button-secondary" onClick={()=>setMode('clusters')}>Explore DevHarbour <span>↗</span></motion.button>
    </motion.div>
    <motion.div className="hero-footnote" initial={reduce?false:'hidden'} animate="visible" variants={appear} transition={{delay:.9}}><div className="footnote-line"/><span>ONE PLACE. INFINITE POSSIBILITIES.</span></motion.div>
   </div>
   <div className="hero-art"><ParticleOrb still={still} mode={mode} onModeChange={setMode}/></div>
  </div>
  <motion.button className="scroll-cue" onClick={discover} animate={still?{}:{y:[0,7,0]}} transition={{repeat:Infinity,duration:2.4}}>SCROLL TO DISCOVER <span>↓</span></motion.button>
  <div className="hero-index">CREATED TO CREATE. &nbsp; / &nbsp; EST. 2026</div>
  <button className="hero-motion-control" type="button" onClick={()=>setPaused(!paused)} disabled={!!reduce} aria-label={paused?'Resume hero motion':'Pause hero motion'} aria-pressed={paused}>{reduce?'Reduced motion':paused?'Resume motion':'Pause motion'}</button>
 </section>;
}
