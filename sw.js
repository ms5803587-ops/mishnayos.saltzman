const CACHE_NAME = "mishnayot-zaltsman-v15-inline-mobile";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./logo.png",
  "./header-logo.png",
  "./site-icon-round.png",
  "./home-bg.png",
  "./home-bg-mobile.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => Promise.allSettled(ASSETS.map(asset => cache.add(asset)))));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if(req.mode === "navigate" || req.url.endsWith("/index.html")){
    event.respondWith(fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      return res;
    }).catch(() => caches.match(req)));
    return;
  }
  event.respondWith(fetch(req).catch(() => caches.match(req)));
});
