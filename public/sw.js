const CACHE_NAME = "formmicro2-pwa-v2";

const OFFLINE_URLS = [
  "/",
  "/arrivee",
  "/depart",
  "/admin",
  "/images/logo.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS).catch(() => {
        // On ignore les erreurs de pré-cache pour ne rien casser
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // On ne gère que les requêtes GET
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // 1. Ne JAMAIS intercepter les appels API ou les requêtes Next internes
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/favicon") ||
    url.pathname.startsWith("/manifest")
  ) {
    return; // comportement réseau normal, pas de cache SW
  }

  // 2. Pour les pages HTML (navigations), on fait réseau -> fallback cache
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          return networkResponse;
        })
        .catch(() => caches.match(request).then((res) => res || caches.match("/")))
    );
    return;
  }

  // 3. Pour le reste (images, css, etc.), cache-first avec mise à jour
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // On renvoie le cache, mais on met à jour en arrière-plan
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse.ok) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse).catch(() => {});
              });
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse.clone()).catch(() => {});
            });
          }
          return networkResponse;
        })
        .catch(() => caches.match("/").then((fallback) => fallback || Response.error()));
    })
  );
});

