const CACHE_NAME = "mishnayot-zaltsman-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./logo.png",
  "./header-logo.png",
  "./home-bg.png",
  "./home-bg-mobile.png",
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
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
