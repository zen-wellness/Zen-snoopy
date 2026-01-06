const CACHE_NAME = 'zen-snoopy-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png'
];

self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const options = {
    body: data.body || 'Task Reminder!',
    icon: '/attached_assets/IMG_0336_1767718090891.jpeg',
    badge: '/attached_assets/IMG_0336_1767718090891.jpeg',
    vibrate: [200, 100, 200],
    data: { url: '/' }
  };
  event.waitUntil(self.registration.showNotification(data.title || '🌸 Zen Snoopy', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
