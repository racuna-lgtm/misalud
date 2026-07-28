// ── MISALUD — SERVICE WORKER ────────────────────────────────
// Estrategia: NETWORK FIRST.
// Siempre intenta traer la version nueva desde internet; el cache
// es solo respaldo para cuando no hay señal. Asi un deploy nuevo
// se ve al tiro y no queda una version vieja pegada.

// IMPORTANTE: subir el numero de version cada vez que subas cambios.
// Eso obliga a borrar el cache viejo en todos los telefonos.
const VERSION = 'misalud-v1';

// Archivos que se guardan para funcionar sin internet.
// Agrega aqui cualquier pagina .html nueva que crees.
const ARCHIVOS = [
  './',
  './index.html',
  './home.html',
  './firebase.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(VERSION).then(function (cache) {
      // addAll falla completo si UN archivo no existe; por eso uno por uno.
      return Promise.all(
        ARCHIVOS.map(function (url) {
          return cache.add(url).catch(function () {
            console.warn('[SW] no se pudo cachear:', url);
          });
        })
      );
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (nombres) {
      return Promise.all(
        nombres.map(function (n) {
          if (n !== VERSION) return caches.delete(n);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (e) {
  const req = e.request;

  // Solo GET del mismo sitio. Firebase y Google Fonts pasan directo,
  // sin tocar el cache (los datos siempre frescos desde la red).
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  e.respondWith(
    fetch(req)
      .then(function (res) {
        const copia = res.clone();
        caches.open(VERSION).then(function (c) { c.put(req, copia); });
        return res;
      })
      .catch(function () {
        return caches.match(req).then(function (hit) {
          return hit || caches.match('./index.html');
        });
      })
  );
});
