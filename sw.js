const CACHE_NAME = "mishnayot-zaltsman-v19-deep-light-redesign";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./app-v19.css",
  "./mobile-app-final.js",
  "./logo.png",
  "./header-logo.png",
  "./site-icon-round.png",
  "./icon-192.png",
  "./icon-512.png",
  "./LiaShaharit-Regular.ttf",
  "./MZ_BRAHOT_L1.txt",
  "./MZ_PEAA_L1.txt",
  "./MZ_DEMAY_L1.txt",
  "./MZ_KILAIIM_L1.txt",
  "./MZ_SHVIIT_L1.txt",
  "./MZ_TRUMOT_L1.txt",
  "./MZ_MEASROT_L1.txt",
  "./MZ_MEASER_SHENI_L1.txt",
  "./MZ_HALA_L1.txt",
  "./MZ_ORLA_L1.txt",
  "./MZ_BIKURIM_L1.txt"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(
        ASSETS.map(asset =>
          cache.add(new Request(asset, {cache: "reload"}))
            .catch(error => console.warn("Asset was not cached:", asset, error))
        )
      )
    )
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
  if(req.method !== "GET") return;

  const isAppShell = req.mode === "navigate"
    || url.pathname.endsWith("/index.html")
    || url.pathname.endsWith("/app-v19.css")
    || url.pathname.endsWith("/mobile-app-final.js")
    || url.pathname.endsWith("/sw.js");

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

  event.respondWith(
    caches.match(req).then(cached =>
      cached || fetch(req).then(response => {
        if(response && response.ok && url.origin === self.location.origin){
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        }
        return response;
      })
    )
  );
});
