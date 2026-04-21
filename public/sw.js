// BuRegDes Next — Service Worker (Session 11)
// Strategy: Network-first, fallback to cache
// Cache name berubah tiap deploy agar auto-update

const CACHE_NAME = 'buregdes-v1'
const OFFLINE_URL = '/'

// Assets yang di-cache saat install
const PRECACHE = [
  '/',
  '/app',
  '/manifest.json',
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  // Hanya handle GET request, skip Firebase & API calls
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)
  if (
    url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('anthropic')
  ) return

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() =>
        caches.match(event.request).then(cached => cached ?? caches.match(OFFLINE_URL))
      )
  )
})
