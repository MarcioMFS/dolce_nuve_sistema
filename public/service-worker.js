const CACHE_NAME = 'dolce-nuve-cache-v2'; // Incrementei a versão para forçar atualização
const APP_STATIC = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/apple-touch-icon-180x180.png',
  '/apple-touch-icon-152x152.png',
  '/apple-touch-icon-144x144.png',
  '/apple-touch-icon-120x120.png',
  '/apple-touch-icon-114x114.png',
  '/apple-touch-icon-76x76.png',
  '/apple-touch-icon-72x72.png',
  '/apple-touch-icon-57x57.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_STATIC))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  const isStaticAsset = APP_STATIC.some(asset => {
    if (asset === '/') return url.pathname === '/';
    return url.pathname === asset || url.pathname.endsWith(asset);
  });
  
  // Estratégia para assets estáticos: Cache primeiro, depois rede
  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          return response;
        });
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }
  
  // Estratégia para dados dinâmicos: Rede primeiro, depois cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Se a resposta da rede for bem-sucedida, clone e armazene no cache
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Se a rede falhar, tente servir do cache
        return caches.match(event.request).then(cached => {
          if (cached) {
            return cached;
          }
          // Se não houver cache, retorne uma resposta de fallback para navegação
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          // Para outros tipos de requisição, retorne um erro
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
      })
  );
});