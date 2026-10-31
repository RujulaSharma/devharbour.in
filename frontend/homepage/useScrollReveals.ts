import {useEffect} from 'react';
import {animate,useReducedMotion} from 'framer-motion';

// The landing page scrolls inside #intro, rather than the browser window.
export function useScrollReveals(){
 const reduce=useReducedMotion();
 useEffect(()=>{
  const root=document.getElementById('intro');
  const home=root?.querySelector('#dh-homepage')?.shadowRoot?.querySelector('#dh2-homepage');
  if(!root||!home||reduce||!('IntersectionObserver' in window))return;
  const controls:ReturnType<typeof animate>[]=[];
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(!entry.isIntersecting)return;
   const element=entry.target as HTMLElement;
   observer.unobserve(element);
   controls.push(animate(element,{opacity:[.25,1],y:[26,0]},{duration:.7,ease:[.22,1,.36,1]}));
  }),{root,threshold:.08});
  home.querySelectorAll('#landing .zh, #landing .fx, #landing .zc, #landing .hkc, #landing .zo, #landing .lbx, #landing .zq, #landing .zpr, #landing .zm2, #landing .team-stage').forEach(element=>observer.observe(element));
  return()=>{observer.disconnect();controls.forEach(control=>control.stop());};
 },[reduce]);
}
