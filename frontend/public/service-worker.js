// public/service-worker.js

self.addEventListener('install', (e) => {
    e.waitUntil(
      caches.open('cache').then((cache) => {
        return cache.addAll([
          '/',
          '/index.html',
          '/manifest.json',
          // '/offline.html', // Offline access page
          // Add other static files here
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', (e) => {
    e.respondWith(
      caches.match(e.request).then((response) => {
        return response || fetch(e.request);
      })
    );
  });