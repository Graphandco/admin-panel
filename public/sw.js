/* Service worker minimal — installabilité PWA (pas de cache offline agressif) */
const CACHE = "dockpanel-shell-v1";
const PRECACHE = ["/", "/logo192.png", "/logo512.png", "/maskable.png"];

self.addEventListener("install", (event) => {
   event.waitUntil(
      caches
         .open(CACHE)
         .then((cache) => cache.addAll(PRECACHE))
         .then(() => self.skipWaiting())
         .catch(() => self.skipWaiting()),
   );
});

self.addEventListener("activate", (event) => {
   event.waitUntil(
      caches
         .keys()
         .then((keys) =>
            Promise.all(
               keys
                  .filter((k) => k !== CACHE)
                  .map((k) => caches.delete(k)),
            ),
         )
         .then(() => self.clients.claim()),
   );
});

self.addEventListener("fetch", (event) => {
   const { request } = event;
   if (request.method !== "GET") return;

   const url = new URL(request.url);
   if (url.origin !== self.location.origin) return;

   // Navigations : réseau d'abord, fallback cache
   if (request.mode === "navigate") {
      event.respondWith(
         fetch(request)
            .then((res) => {
               const copy = res.clone();
               caches.open(CACHE).then((c) => c.put(request, copy));
               return res;
            })
            .catch(() => caches.match(request).then((r) => r || caches.match("/"))),
      );
      return;
   }

   // Assets statiques locaux : cache puis réseau
   if (
      url.pathname.startsWith("/_next/static/") ||
      /\.(?:png|svg|ico|webp|jpg|jpeg|woff2?)$/i.test(url.pathname)
   ) {
      event.respondWith(
         caches.match(request).then(
            (cached) =>
               cached ||
               fetch(request).then((res) => {
                  const copy = res.clone();
                  caches.open(CACHE).then((c) => c.put(request, copy));
                  return res;
               }),
         ),
      );
   }
});
