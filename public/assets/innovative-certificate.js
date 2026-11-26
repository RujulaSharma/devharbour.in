(() => {
  const $ = id => document.getElementById(id);
  const id = new URLSearchParams(location.search).get('id');
  let certificate;
  function headers() { const token = localStorage.getItem('dh_token') || localStorage.getItem('dh-auth-token'); return {'Content-Type':'application/json', ...(token ? {Authorization:'Bearer '+token} : {})}; }
  async function call(path='', options={}) {
    const response = await fetch('/api/innovative-certificate'+path, {...options,headers:headers(),credentials:'include',signal:AbortSignal.timeout(20000)});
    if (!response.ok) { const body=await response.json(); throw Error(response.status===401?'Sign in with your registered email to manage this certificate.':body.error||'Request failed'); }
    return response;
  }
  function display(c) { certificate=c; $('recipient').textContent=c.name; $('name').value=c.name; $('credential').textContent=c.id+' · '+c.date; $('share').disabled=false; }
  async function load() {
    $('name-form').hidden=true; $('download').hidden=true;
    try {
      if (id) {
        if (!/^IN-26-[0-9]{7}$/.test(id)) throw Error('Invalid certificate link.');
        const response=await fetch('/api/certificates/innovative-india/verify/'+encodeURIComponent(id),{cache:'no-store',signal:AbortSignal.timeout(20000)});
        const data=await response.json();
        if (!response.ok || !data.verified) throw Error('This certificate is invalid or unavailable.');
        const c=data.credential;
        display({id:c.credential_id,name:c.recipient_name || "Verified participant",date:c.issue_date});
        $('status').textContent='Verified Innovative India participation certificate.';
      }
      try {
        const own=await(await call()).json();
        if (!id || own.id===id) {
          display(own); $('name-form').hidden=false; $('download').hidden=false;
          $('save').disabled=false; $('download').disabled=false;
          $('status').textContent='Verified participation. You can update the name and download your certificate.';
          const preview=await fetch('/api/certificates/preview/my-certificate',{headers:headers(),credentials:'include',signal:AbortSignal.timeout(20000)});
          if(preview.ok){const old=document.querySelector('#pdf-preview');if(old){URL.revokeObjectURL(old.src);old.remove()}const frame=document.createElement('iframe');frame.id='pdf-preview';frame.title='Innovative India certificate preview';frame.src=URL.createObjectURL(await preview.blob());frame.style='width:100%;height:480px;border:0;margin-top:20px';document.querySelector('.certificate').appendChild(frame);}
        }
      } catch(error) { if (!id) throw error; }
    } catch(error) { $('status').textContent=error.message; $('recipient').textContent='Certificate unavailable'; }
  }
  $('name-form').onsubmit=async event=>{event.preventDefault();$('save').disabled=true;try{await call('/name',{method:'PATCH',body:JSON.stringify({name:$('name').value})});await load()}catch(error){$('status').textContent=error.message}finally{$('save').disabled=false}};
  $('download').onclick=async()=>{try{const blob=await(await call('/pdf')).blob();const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='Innovative India-Participation.pdf';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch(error){$('status').textContent=error.message}};
  $('share').onclick=async()=>{try{await navigator.clipboard.writeText(new URL('/innovative-certificate/?id='+encodeURIComponent(certificate.id),location.origin).href);$('status').textContent='Certificate link copied.'}catch{$('status').textContent='Unable to copy link.'}};
  load();
})();
