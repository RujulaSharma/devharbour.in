/* Account settings use existing authenticated endpoints; no theme panel. */
(()=>{
 const root=document.getElementById('account-settings');if(!root)return;let controller,version=0;
 function el(tag,text,parent=root){const n=document.createElement(tag);if(text)n.textContent=text;parent.append(n);return n;}
 function button(label,action,parent=root){const b=el('button',label,parent);b.type='button';b.onclick=action;return b;}
 async function render(){const request=++version;controller?.abort();controller=new AbortController();root.replaceChildren();const user=window.currentUser;
  el('h2','Account settings');el('p','Manage your profile, privacy, and current session.');
  if(!user){el('p','Sign in to manage your account.');button('Sign in',()=>window.openAuthModal?.('login'));return;}
  const profile=el('section');profile.className='account-panel';el('h3','Profile',profile);el('p',user.fullName||user.username,profile);button('Edit profile',()=>window.openProfileModal?.(),profile);
  const privacy=el('section');privacy.className='account-panel';el('h3','Privacy',privacy);const status=el('p','Loading your preferences…',privacy);status.setAttribute('role','status');
  const session=el('section');session.className='account-panel';el('h3','Session',session);el('p','Sign out of this browser when using a shared computer.',session);button('Sign Out',()=>window.handleLogout?.(),session);
  try{const r=await fetch('/api/user/settings',{credentials:'same-origin',cache:'no-store',signal:controller.signal});if(!r.ok)throw Error();const data=await r.json();if(request!==version||window.currentUser?.id!==user.id)return;status.textContent='Choose whether other visitors can view your developer profile.';
   const form=el('form','',privacy),label=el('label','',form),checkbox=el('input','',label);checkbox.type='checkbox';checkbox.checked=!!data.settings?.profile_public;label.append(document.createTextNode(' Make my developer profile public'));const save=el('button','Save preferences',form);save.type='submit';const feedback=el('p','',form);feedback.setAttribute('role','status');
   form.onsubmit=async event=>{event.preventDefault();save.disabled=true;feedback.textContent='Saving…';try{const result=await fetch('/api/user/settings',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({profilePublic:checkbox.checked}),signal:controller.signal});if(!result.ok)throw Error();if(request===version)feedback.textContent='Preferences saved.';}catch(error){if(request===version&&error.name!=='AbortError')feedback.textContent='Preferences could not be saved. Please retry.';}finally{save.disabled=false;}};
  }catch(error){if(request===version&&error.name!=='AbortError'){status.textContent='Preferences could not be loaded.';button('Retry',render,privacy);}}
 }
 window.addEventListener('dh:auth-changed',render);window.addEventListener('dh:route-changed',()=>{if(location.pathname==='/settings')render();});render();
})();
