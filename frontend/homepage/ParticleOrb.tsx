import { useEffect, useMemo, useRef, useState, type RefObject, type Dispatch, type SetStateAction, type PointerEvent } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { clamp, smooth, createParticleData, textCloud } from './orb-particles';

export type Mode = 'orb' | 'word' | 'clusters';
type FieldProps = {count:number;mode:Mode;scroll:number;pointer:RefObject<{x:number;y:number;active:boolean}>;dragging:RefObject<boolean>;dragDelta:RefObject<{x:number;y:number}>;reduced:boolean;paused:boolean};
function ParticleField({ count, mode, scroll, pointer, dragging, dragDelta, reduced, paused }: FieldProps) {
  const points = useRef<THREE.Points>(null);
  const invalidate=useThree(state=>state.invalidate);
  const lastFrozen=useRef('');
  useEffect(()=>{invalidate();},[mode,scroll,paused,invalidate]);
  const elapsed = useRef(0);
  const rotation = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const mix = useRef({ text: 0, clusters: 0, entrance: 0 });
  const data = useMemo(() => createParticleData(count), [count]);
  const text = useMemo(() => textCloud('DEVHARBOUR', count), [count]);
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('color', new THREE.BufferAttribute(data.colors, 3));
    return geo;
  }, [count, data]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_, delta) => {
    if (!points.current) return;
    const frozen=reduced||paused;
    const frameKey=mode+':'+scroll;
    if(frozen && lastFrozen.current===frameKey)return;
    lastFrozen.current=frozen?frameKey:'';
    if(frozen){rotation.current.vx=0;rotation.current.vy=0;}
    const dt = Math.min(delta, 0.05), speed = (reduced || paused) ? 1 : Math.min(1, dt * 3.2);
    elapsed.current += dt;
    const wantsText = mode === 'word' ? 1 : 0;
    const wantsClusters = mode === 'clusters' ? 1 : smooth((scroll - 0.20) / 0.62);
    mix.current.text += (wantsText - mix.current.text) * ((reduced || paused) ? 1 : Math.min(1, dt * 3.8));
    mix.current.clusters += (wantsClusters - mix.current.clusters) * ((reduced || paused) ? 1 : Math.min(1, dt * 2.6));
    mix.current.entrance = Math.min(1, mix.current.entrance + ((reduced || paused) ? 1 : dt * 0.58));
    const entrance = (reduced || paused) ? 1 : smooth(mix.current.entrance);
    const targetX = pointer.current.y * 0.16;
    if (dragging.current) {
      rotation.current.vy = dragDelta.current.x * 0.0045;
      rotation.current.vx = dragDelta.current.y * 0.0045;
      dragDelta.current.x = 0; dragDelta.current.y = 0;
    } else {
      rotation.current.vy *= Math.pow(0.92, dt * 60);
      rotation.current.vx *= Math.pow(0.92, dt * 60);
    }
    rotation.current.x += rotation.current.vx;
    rotation.current.y += rotation.current.vy + ((reduced || paused) ? 0 : dt * 0.085);
    rotation.current.x += (targetX - rotation.current.x) * dt * 0.22;
    const rotX = rotation.current.x, rotY = rotation.current.y;
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX), cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const pos = geometry.attributes.position.array;
    const mText = mix.current.text, mClusters = mix.current.clusters;
    const time = elapsed.current;
    for (let i = 0; i < count; i++) {
      const o = i * 3;
      const sx = data.sphere[o], sy = data.sphere[o + 1], sz = data.sphere[o + 2];
      const x1 = sx * cosY + sz * sinY, z1 = sz * cosY - sx * sinY;
      const y1 = sy * cosX - z1 * sinX, z2 = sy * sinX + z1 * cosX;
      const wave = (reduced || paused) ? 0 : Math.sin(time * 0.9 + i * 0.14) * 0.021;
      let x = x1 + wave, y = y1 + wave, z = z2;
      const dx = x - pointer.current.x * 2.7, dy = y - pointer.current.y * 1.9;
      const influence = pointer.current.active ? Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 0.87) : 0;
      x += dx * influence * 0.18; y += dy * influence * 0.18; z += influence * 0.38;
      const tx = text[o], ty = text[o + 1], tz = text[o + 2];
      const burst = Math.sin(Math.PI * mText) * 0.27;
      x = x * (1 - mText) + tx * mText + data.random[o] * burst;
      y = y * (1 - mText) + ty * mText + data.random[o + 1] * burst;
      z = z * (1 - mText) + tz * mText + data.random[o + 2] * burst;
      x = x * (1 - mClusters) + data.clusters[o] * mClusters;
      y = y * (1 - mClusters) + data.clusters[o + 1] * mClusters;
      z = z * (1 - mClusters) + data.clusters[o + 2] * mClusters;
      const appear = (reduced || paused) ? 1 : entrance;
      pos[o] = x * appear + data.random[o] * (1 - appear);
      pos[o + 1] = y * appear + data.random[o + 1] * (1 - appear);
      pos[o + 2] = z * appear + data.random[o + 2] * (1 - appear);
    }
    geometry.attributes.position.needsUpdate = true;
    points.current.position.x += ((scroll > 0.05 ? smooth((scroll - 0.05) / 0.8) * 1.0 : 0) - points.current.position.x) * speed * 0.08;
  });
  return <points ref={points} geometry={geometry} frustumCulled={false}>
    <pointsMaterial size={0.031} sizeAttenuation transparent opacity={0.94} vertexColors blending={THREE.AdditiveBlending} depthWrite={false} />
  </points>;
}

function canWebGL() {
  try { const canvas = document.createElement('canvas'); return !!(canvas.getContext('webgl2') || canvas.getContext('webgl')); } catch { return false; }
}

function SuppliedOrb({ mode, setMode, scroll, onCluster, paused, active }: {mode:Mode;setMode:Dispatch<SetStateAction<Mode>>;scroll:number;onCluster:(name:string)=>void;paused:boolean;active:boolean}) {
  const [supported] = useState(canWebGL);
  const [reduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [mobile] = useState(() => window.innerWidth < 700);
  const pointer = useRef({ x: 0, y: 0, active: false });
  const dragging = useRef(false);
  const dragDelta = useRef({ x: 0, y: 0 });
  const origin = useRef({ x: 0, y: 0, lastX: 0, lastY: 0, moved: false });
  const clickTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const clustersVisible = mode === 'clusters' || scroll > 0.67;
  useEffect(() => () => { clearTimeout(clickTimer.current); clearTimeout(resetTimer.current); }, []);
  const activateWord = () => {
    clearTimeout(resetTimer.current);
    setMode('word');
    resetTimer.current = setTimeout(() => setMode('orb'), 2450);
  };
  const handleClick = () => {
    if (origin.current.moved) return;
    clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => { if (mode === 'clusters') setMode('orb'); else activateWord(); }, 225);
  };
  const handleDoubleClick = () => {
    clearTimeout(clickTimer.current); clearTimeout(resetTimer.current);
    setMode(mode === 'clusters' ? 'orb' : 'clusters');
  };
  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if(paused || reduced) return;
    const r = event.currentTarget.getBoundingClientRect();
    pointer.current.x = clamp(((event.clientX - r.left) / r.width) * 2 - 1, -1, 1);
    pointer.current.y = -clamp(((event.clientY - r.top) / r.height) * 2 - 1, -1, 1);
    pointer.current.active = true;
    if (dragging.current) {
      const dx = event.clientX - origin.current.lastX, dy = event.clientY - origin.current.lastY;
      dragDelta.current.x += dx; dragDelta.current.y += dy;
      if (Math.abs(event.clientX - origin.current.x) + Math.abs(event.clientY - origin.current.y) > 7) origin.current.moved = true;
      origin.current.lastX = event.clientX; origin.current.lastY = event.clientY;
    }
  };
  const down = (event: PointerEvent<HTMLDivElement>) => {
    if(paused || reduced) return;
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = true;
    origin.current = { x: event.clientX, y: event.clientY, lastX: event.clientX, lastY: event.clientY, moved: false };
  };
  const up = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const moved = origin.current.moved;
    dragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!moved) handleClick();
  };
  return <div className="orb-stage" data-mode={mode} data-paused={paused || reduced} aria-label="Interactive DevHarbour particle sculpture">
    <div className="orb-aura" aria-hidden="true" />
    {supported ? <div className="orb-canvas" onPointerMove={handleMove} onPointerDown={down} onPointerUp={up} onLostPointerCapture={() => { dragging.current = false; }} onPointerCancel={() => { dragging.current = false; }} onPointerLeave={() => { pointer.current.active = false; }} onDoubleClick={handleDoubleClick}>
      <Canvas frameloop={!active ? 'never' : paused || reduced ? 'demand' : 'always'} camera={{ position: [0, 0, 8.6], fov: 45 }} dpr={[1, mobile ? 1.25 : 1.75]} gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}>
        <ParticleField count={reduced ? 1700 : mobile ? 2800 : 5900} mode={mode} scroll={scroll} pointer={pointer} dragging={dragging} dragDelta={dragDelta} reduced={reduced} paused={paused} />
      </Canvas>
    </div> : <div className="webgl-fallback">DevHarbour<span>Learn · Build · Connect</span></div>}
    <div className={`center-word ${mode === 'orb' && scroll < 0.4 ? 'visible' : ''}`} aria-hidden="true">DevHarbour</div>
    {clustersVisible && <div className="cluster-hotspots" aria-label="Feature clusters">
      {['Learn', 'Build', 'Connect'].map((item) => <button key={item} className="cluster-hotspot" onClick={() => { onCluster(item); }} aria-label={`Explore ${item}`}>{item}<span>↗</span></button>)}
    </div>}
    <div className={`orbit-instructions ${clustersVisible ? 'hidden' : ''}`}><span className="instruction-dot"/> DRAG TO ROTATE <span className="dot-separator">·</span> CLICK TO TRANSFORM <span className="dot-separator">·</span> DOUBLE CLICK TO EXPLORE</div>
    <div className="orb-keyboard-controls"><button onClick={activateWord} title="Transform particles into the DevHarbour wordmark">Morph to text</button><button onClick={() => { clearTimeout(resetTimer.current); setMode(mode === 'clusters' ? 'orb' : 'clusters'); }} title="Toggle three feature clusters">{mode === 'clusters' ? 'Reset sphere' : 'Explore clusters'}</button></div>
  </div>;
}

// Connect the original orb to the existing landing-page scroller and pause control.
export default function ParticleOrb({still,mode:controlledMode,onModeChange}:{still:boolean;mode?:Mode;onModeChange?:Dispatch<SetStateAction<Mode>>}) {
 const [localMode,setLocalMode]=useState<Mode>('orb');
 const mode=controlledMode??localMode,setMode=onModeChange??setLocalMode;
 const [scroll,setScroll]=useState(0);
 const [active,setActive]=useState(true);
 const host=useRef<HTMLDivElement>(null);
 useEffect(()=>{
   const intro=document.getElementById('intro');
   let frame=0, intersecting=true;
   const update=()=>{frame=0;setScroll(clamp((intro?.scrollTop||0)/Math.max(1,(intro?.clientHeight||innerHeight)*1.18)));};
   const onScroll=()=>{if(!frame)frame=requestAnimationFrame(update);};
   const visibility=()=>setActive(intersecting&&!document.hidden);
   const observer=new IntersectionObserver(entries=>{intersecting=entries[0].isIntersecting;visibility();},{root:intro});
   if(host.current)observer.observe(host.current);
   intro?.addEventListener('scroll',onScroll,{passive:true});document.addEventListener('visibilitychange',visibility);update();
   return()=>{cancelAnimationFrame(frame);observer.disconnect();intro?.removeEventListener('scroll',onScroll);document.removeEventListener('visibilitychange',visibility);};
 },[]);
 const onCluster=(name:string)=>{const routes:Record<string,string>={Learn:'learn',Build:'projects',Connect:'comm'};window.goApp?.(routes[name]);};
 return <div ref={host} className="supplied-orb"><SuppliedOrb mode={mode} setMode={setMode} scroll={scroll} onCluster={onCluster} paused={still} active={active}/></div>;
}
