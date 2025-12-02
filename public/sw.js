// Service Worker для Чип&Гаджет
const CACHE_NAME = 'chip-gadget-v2';
const OFFLINE_PAGE = '/offline.html';

// Ресурсы для кэширования при установке
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/logo-192.png',
  '/logo-512.png'
];

// Установка Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Установка');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Кэширование ресурсов');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Установка завершена');
        return self.skipWaiting();
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', event => {
  console.log('[Service Worker] Активация');
  
  // Удаляем старые кэши
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Удаляем старый кэш:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Активация завершена');
      return self.clients.claim();
    })
  );
});

// Обработка запросов
self.addEventListener('fetch', event => {
  // Пропускаем не-GET запросы
  if (event.request.method !== 'GET') return;
  
  // Пропускаем chrome-extension
  if (event.request.url.indexOf('chrome-extension') !== -1) return;
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Возвращаем кэшированный ресурс, если есть
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Иначе делаем сетевой запрос
        return fetch(event.request)
          .then(response => {
            // Клонируем ответ для кэширования
            const responseToCache = response.clone();
            
            // Кэшируем только успешные ответы
            if (response.status === 200) {
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            
            return response;
          })
          .catch(error => {
            console.log('[Service Worker] Ошибка загрузки:', error);
            
            // Для HTML запросов показываем оффлайн-страницу
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match(OFFLINE_PAGE);
            }
            
            return new Response('Сеть недоступна', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Получение сообщений от клиента
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});