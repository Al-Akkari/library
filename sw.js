const APP='library-app-v1', FILES='library-files-v1';
const SHELL=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(APP).then(c=>c.addAll(SHELL)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim());});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const u=new URL(req.url);
  if(u.hostname==='api.github.com') return;
  // الملفات المحفوظة: من الجهاز أولاً
  if(u.pathname.includes('/files/')){
    e.respondWith(caches.open(FILES).then(c=>c.match(req)).then(r=>r||fetch(req)));return;
  }
  // الصفحة والمكتبات: الشبكة أولاً ثم النسخة المحفوظة
  e.respondWith(fetch(req).then(res=>{
    if(res.ok&&(u.origin===location.origin||u.hostname==='cdnjs.cloudflare.com')){const cp=res.clone();caches.open(APP).then(c=>c.put(req,cp));}
    return res;
  }).catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match('index.html'))));
});
