const CACHE_NAME = "formmicro2-pwa-v1";

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

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();

          // On ne met en cache que les réponses valides
          if (networkResponse.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone).catch(() => {
                // Ne rien faire si le put échoue
              });
            });
          }

          return networkResponse;
        })
        .catch(() => {
          // En cas d'erreur réseau, on renvoie la page d'accueil si possible
          return caches.match("/").then((fallback) => fallback || Response.error());
        });
    })
  );
});

