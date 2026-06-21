const STATIC_CACHE = 'kalunez-static-v1';
const AUDIO_CACHE = 'kalunez-audio-v1';
const API_CACHE = 'kalunez-api-v1';

// Static assets to precache on install
const PRECACHE_URLS = ['/', '/index.html'];

// Routes/patterns that should serve from cache first
const AUDIO_EXTS = /\.(mp3|wav|ogg|aac|m4a|flac)(\?.*)?$/i;
const IMAGE_EXTS = /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i;

// API base44 entity endpoints to cache (network-first with fallback)
const API_PATTERNS = [
  /\/api\/entities\/Track/,
  /\/api\/entities\/Playlist/,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const valid = [STATIC_CACHE, AUDIO_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !valid.includes(k)).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Skip non-GET and cross-origin chrome-extension etc.
  if (request.method !== 'GET') return;
  if (!url.startsWith('http')) return;

  // Audio: cache-first with background update
  if (AUDIO_EXTS.test(url)) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request).catch(() => null);
        if (response && response.ok) {
          cache.put(request, response.clone());
        }
        return response || new Response('Audio unavailable offline', { status: 503 });
      })
    );
    return;
  }

  // Images: cache-first
  if (IMAGE_EXTS.test(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request).catch(() => null);
        if (response && response.ok) cache.put(request, response.clone());
        return response || new Response('Image unavailable offline', { status: 503 });
      })
    );
    return;
  }

  // API / entity data: network-first with cache fallback
  if (API_PATTERNS.some((p) => p.test(url))) {
    event.respondWith(
      caches.open(API_CACHE).then(async (cache) => {
        try {
          const response = await fetch(request);
          if (response.ok) cache.put(request, response.clone());
          return response;
        } catch {
          const cached = await cache.match(request);
          return cached || new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      })
    );
    return;
  }

  // Static app shell: network-first
  event.respondWith(
    fetch(request).catch(() => caches.match(request).then((r) => r || caches.match('/')))
  );
});

// Message: force cache a specific audio URL (called when user saves to playlist)
self.addEventListener('message', (event) => {
  if (event.data?.type === 'CACHE_AUDIO' && event.data.url) {
    caches.open(AUDIO_CACHE).then(async (cache) => {
      const existing = await cache.match(event.data.url);
      if (!existing) {
        fetch(event.data.url)
          .then((r) => { if (r.ok) cache.put(event.data.url, r); })
          .catch(() => {});
      }
    });
  }
});
