self.addEventListener('push',event=>{
  event.waitUntil((async()=>{
    const {id}=event.data.json();
    const response=await fetch('/api/study/state',{credentials:'same-origin',cache:'no-store'});
    if(!response.ok) return;
    const {group}=await response.json();
    const start=group?.starts?.find(item=>item.session_id===id);
    if(start) await self.registration.showNotification('Study Together',{
      body:start.username+' started studying in '+group.name+'.',tag:'study-'+id
    });
  })());
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil(clients.openWindow('/timer'));
});
