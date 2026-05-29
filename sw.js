const CACHE_NAME = "mishnayot-zaltsman-v44-v143-hard-fixes";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./mobile-app-final.js",
  "./logo.png",
  "./header-logo.png",
  "./site-icon-round.png",
  "./icon-192.png",
  "./icon-512.png",
  "./LiaShaharit-Regular.ttf"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => Promise.all(ASSETS.map(asset => cache.add(new Request(asset, {cache: "reload"})))))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);
  const isAppShell = req.mode === "navigate" || url.pathname.endsWith("/index.html") || url.pathname.endsWith("/mobile-app-final.js") || url.pathname.endsWith("/sw.js");

  if (isAppShell) {
    event.respondWith(
      fetch(new Request(req, {cache: "reload"}))
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(cached => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(fetch(req).catch(() => caches.match(req)));
});
