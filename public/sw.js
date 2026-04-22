// BuRegDes Next — Service Worker (Session 18)
// Strategy: Network First — selalu ambil dari network, tanpa cache delay
// Update: skipWaiting + controllerchange untuk instant update tanpa hard refresh

const CACHE_NAME = 'buregdes-v18'
const OFFLINE_FALLBACK = '/'

self.addEventListener('install', (event) => {
  // Skip waiting — langsung aktif tanpa menunggu tab lama tutup
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Hapus cache lama
      caches.keys().then(keys =>
        Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
      ),
      // Ambil kontrol semua tab segera
      self.clients.claim(),
    ])
  )
})

self.addEventListener('fetch', (event) => {
  // Hanya handle GET request
  if (event.request.method !== 'GET') return
  // Skip chrome-extension dan non-http
  if (!event.request.url.startsWith('http')) return
  // Skip Firebase RTDB — biarkan native handle
  if (event.request.url.includes('firebaseio.com')) return
  if (event.request.url.includes('googleapis.com')) return

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Simpan ke cache untuk fallback offline
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() =>
        // Fallback ke cache jika offline
        caches.match(event.request).then(cached => cached || caches.match(OFFLINE_FALLBACK))
      )
  )
})

// Notify client saat ada update baru
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting()
})
