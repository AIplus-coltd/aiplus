// Service Worker for AI+ PWA
const CACHE_NAME = 'aiplus-v1';
const RUNTIME_CACHE = 'aiplus-runtime-v1';

// キャッシュするファイルのリスト
const STATIC_ASSETS = [
  '/',
  '/tabs/feed',
  '/tabs/ideas',
  '/tabs/inbox',
  '/tabs/me',
  '/tabs/saved',
  '/tabs/score',
  '/tabs/search',
  '/tabs/shop',
];

// インストール
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.log('Cache addAll error:', err);
      });
    })
  );
  self.skipWaiting();
});

// アクティベート
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});
