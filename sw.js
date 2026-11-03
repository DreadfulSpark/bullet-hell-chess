// Offline support for the installed app. The page is fetched network-first so updates show up
// on the next launch; icons and fonts are served from the cache. Bump VERSION when the file list changes.
const VERSION = 'bhc-v1';
const SHELL = ['./', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const put = (req, res) => { if (res.ok || res.type === 'opaque') caches.open(VERSION).then(c => c.put(req, res)) };

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req)
      .then(res => { put('./', res.clone()); return res })
      .catch(() => caches.match('./')));
    return;
  }
  const font = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin !== location.origin && !font) return;
  // Cache first, refreshing in the background.
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(res => { put(req, res.clone()); return res }).catch(() => hit);
    return hit || net;
  }));
});
