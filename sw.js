/* Lila · © Andrés Asensio · CC BY-NC-ND 4.0 · https://creativecommons.org/licenses/by-nc-nd/4.0/deed.es · aula 2026-11-22 · e9f7715 */
const CACHE = 'lila-v2.0';
const ARCHIVOS = ['./', 'index.html', 'manifest.webmanifest', 'icono/icono-180.png', 'icono/icono-192.png', 'icono/icono-512.png'];

self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('lila-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', ev => {
  const pet = ev.request;
  if (pet.method !== 'GET' || new URL(pet.url).origin !== location.origin) return;
  if (pet.mode === 'navigate') {
    const red = fetch(pet).then(r => {
      if (r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put('index.html', copia)); }
      return r;
    });
    const espera = new Promise(ok => setTimeout(ok, 3000)).then(() => caches.match('index.html'));
    ev.respondWith(Promise.race([red.catch(() => caches.match('index.html')), espera.then(r => r || red)])
      .then(r => r || red));
    return;
  }
  ev.respondWith(caches.match(pet).then(r => r || fetch(pet)));
});
