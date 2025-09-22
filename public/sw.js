const CACHE_NAME = "home-dashboard-v6";
const STATIC_CACHE = "static-v6";
const DYNAMIC_CACHE = "dynamic-v6";

const urlsToCache = [
    "/",
    "/manifest.json",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "/icons/apple-touch-icon.png",
];

// Install event - cache core app shell
self.addEventListener("install", (event) => {
    console.log("Service Worker installing...");
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log("Caching app shell");
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
    console.log("Service Worker activating...");
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (
                        cacheName !== STATIC_CACHE &&
                        cacheName !== DYNAMIC_CACHE
                    ) {
                        console.log("Deleting old cache:", cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - network first for API calls, cache first for static assets
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle API calls with network first strategy
    if (url.pathname.startsWith("/api/")) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Only cache successful responses
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback to cache if network fails
                    return caches.match(request);
                })
        );
        return;
    }

    // Handle static assets with cache first strategy
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request).then((response) => {
                // Don't cache non-successful responses
                if (
                    !response ||
                    response.status !== 200 ||
                    response.type !== "basic"
                ) {
                    return response;
                }

                const responseToCache = response.clone();
                caches.open(DYNAMIC_CACHE).then((cache) => {
                    cache.put(request, responseToCache);
                });

                return response;
            });
        })
    );
});
