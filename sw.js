/* 設定判別ツール service worker: 同一オリジンはキャッシュ優先、index.html はネット優先。VERSION が変わると入れ替わる */
var VERSION = 'd347bebcb6';
var CACHE = 'snv-' + VERSION;
var ASSETS = ['./', './index.html', './data.enc', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', function(e){ e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }).then(function(){ return self.skipWaiting(); })); });
self.addEventListener('activate', function(e){ e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener('fetch', function(e){
  var req = e.request; if(req.method !== 'GET') return;
  var url = new URL(req.url);
  if(req.mode === 'navigate' || (url.origin === location.origin && /\/(index\.html)?$/.test(url.pathname))){
    e.respondWith(fetch(req).then(function(r){ var c = r.clone(); caches.open(CACHE).then(function(cc){ cc.put('./index.html', c); }); return r; }).catch(function(){ return caches.match('./index.html'); }));
    return;
  }
  e.respondWith(caches.match(req).then(function(hit){
    if(hit) return hit;
    return fetch(req).then(function(res){ if(res && (res.ok || res.type === 'opaque')){ var c = res.clone(); caches.open(CACHE).then(function(cc){ cc.put(req, c); }); } return res; });
  }));
});
