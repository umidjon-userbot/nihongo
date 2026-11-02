/* Offline cache (cache-first for app shell) */
const CACHE = 'nihongo-start-v1';
const FILES = ['./', './index.html', './manifest.json', './icon.svg', './css/style.css',
  './js/strokes-data.js', './js/kana-data.js', './js/phrases-data.js', './js/lessons-data.js',
  './js/progress.js', './js/srs.js', './js/audio.js', './js/quiz.js', './js/app.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request).then(res => {
    if (res.ok && new URL(e.request.url).origin === location.origin) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match('./index.html'))));
});
