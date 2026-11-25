// ===== SERVICE WORKER v20 — abre al instante (stale-while-revalidate) =====
// Sirve la app desde el cache del dispositivo AL INSTANTE y en segundo plano
// pide la version nueva al servidor. Si hay cambios, la app se recarga sola
// cuando sales de ella o vuelves a entrar.
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDY8LTbU5bwUJHhp3xmSe0ru0UV4siuTmA",
  authDomain: "mis-finanzas-app-2d508.firebaseapp.com",
  projectId: "mis-finanzas-app-2d508",
  storageBucket: "mis-finanzas-app-2d508.firebasestorage.app",
  messagingSenderId: "93452152715",
  appId: "1:93452152715:web:f57900f5caeb2aaa07898e"
});
firebase.messaging(); // notificaciones en segundo plano (FCM las muestra solas)
// >>> Si tu sw.js anterior tenia onBackgroundMessage / notificationclick, pegalo aqui <<<

const CACHE = 'finanzas-v35';
const SHELL = [
  'index.html',
  'style.css?v=17.0',
  'manifest.json',
  'frontend/onboarding.js?v=20.0',
  'frontend/i18n.js?v=20.0',
  'frontend/currency.js?v=20.0',
  'frontend/state.js?v=20.0',
  'frontend/helpers.js?v=20.0',
  'frontend/budgets.js?v=20.0',
  'frontend/balance.js?v=20.0',
  'frontend/categories.js?v=20.0',
  'frontend/transactions.js?v=20.0',
  'backend/firebase-config.js?v=20.0',
  'backend/notifications.js?v=20.0',
  'backend/boards.js?v=20.0',
  'backend/auth.js?v=20.0',
  'backend/sw-register.js?v=20.0',
  'frontend/recommendations.js?v=20.0',
  'frontend/features.js?v=20.0'
];
const SDK = 'https://www.gstatic.com/firebasejs/';

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => Promise.allSettled(SHELL.map((u) => c.add(u)))));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function avisarSiCambio(cache, req, viejo, nuevo) {
  try {
    const a = viejo && (viejo.headers.get('etag') || viejo.headers.get('last-modified'));
    const b = nuevo.headers.get('etag') || nuevo.headers.get('last-modified');
    if (a && b && a !== b) {
      const cs = await self.clients.matchAll({ type: 'window' });
      cs.forEach((c) => c.postMessage({ type: 'app-updated' }));
    }
  } catch (e) {}
}

// 📌 PRESENTACION 8 - SIN INTERNET: responde con lo guardado en caché
async function cacheConRevalidacion(e, req, clave) {
  const cache = await caches.open(CACHE);
  const guardado = await cache.match(clave || req);
  const red = fetch(req, { cache: 'no-cache' }).then(async (res) => {
    if (res && res.ok) {
      const copia = res.clone();
      await avisarSiCambio(cache, req, guardado, res);
      await cache.put(clave || req, copia);
    }
    return res;
  }).catch(() => null);
  e.waitUntil(red);
  if (guardado) { return guardado; }   // instantaneo
  return (await red) || Response.error();
}

// 📌 PRESENTACION 8 - SIN INTERNET: el Service Worker intercepta las peticiones
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // SDK de Firebase (versionado, no cambia): cache primero
  if (req.url.startsWith(SDK)) {
    e.respondWith(caches.open(CACHE).then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone());
      return res;
    }));
    return;
  }

  // Tu propia app (html/js/css/json): del cache al instante + actualiza en segundo plano
  if (url.origin === self.location.origin && url.pathname !== '/sw.js') {
    if (req.mode === 'navigate') {
      e.respondWith(cacheConRevalidacion(e, new Request('index.html'), 'index.html'));
    } else {
      e.respondWith(cacheConRevalidacion(e, req));
    }
  }
  // Todo lo demas (Firestore, Auth, APIs) va directo a internet
});