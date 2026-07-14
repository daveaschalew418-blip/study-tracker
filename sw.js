const CACHE_NAME = 'studysync-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  'https://cdn-icons-png.flaticon.com/512/2232/2232688.png' // App Icon
];

// 1. Install Event: Cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Clean up old caches if updated
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Serve cached assets when offline, fallback to network
self.addEventListener('fetch', (event) => {
  // Only handle GET requests (e.g. loading the page or the icon)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Return cache if found
      }
      
      // Otherwise, try to fetch from network
      return fetch(event.request).catch(() => {
        // Fallback option if network is completely dead
        return caches.match('./index.html');
      });
    })
  );
});
