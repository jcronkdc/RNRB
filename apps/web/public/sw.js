/**
 * Rock N' Roll Basement Service Worker
 *
 * Provides offline-first experience with intelligent caching strategies:
 * - Static assets: Cache-first (fonts, images, JS, CSS)
 * - API calls: Network-first with fallback
 * - Pages: Stale-while-revalidate
 * - Offline fallback page for network failures
 */

const CACHE_VERSION = 'rnrb-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;
const SETLIST_CACHE = `${CACHE_VERSION}-setlists`; // Offline setlists for performers

// Assets to cache on install (critical path)
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/logo-dark.png',
  '/logo-light.png',
  '/icon-192.png',
  '/icon-512.png',
  '/perform', // Performer mode landing
];

// IndexedDB for setlist data (more reliable than cache for structured data)
const DB_NAME = 'rnrb-offline';
const DB_VERSION = 1;
const SETLIST_STORE = 'setlists';

// Cache strategies
const CACHE_STRATEGIES = {
  // Static assets - cache first, network fallback
  cacheFirst: [
    /\/_next\/static\//,
    /\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|woff|woff2|ttf|otf)$/,
    /\/fonts\//,
  ],
  // API requests - network first, cache fallback
  networkFirst: [/\/api\//],
  // Pages - stale while revalidate
  staleWhileRevalidate: [/^https:\/\/[^/]+\/?$/, /^https:\/\/[^/]+\/(?!api|_next)[^?]*$/],
};

// Install event - precache critical assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Precaching critical assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[SW] Precache failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (name) =>
                name.startsWith('rnrb-') &&
                name !== STATIC_CACHE &&
                name !== DYNAMIC_CACHE &&
                name !== API_CACHE &&
                name !== SETLIST_CACHE
            )
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      }),
      // Initialize IndexedDB for offline setlists
      initOfflineDB(),
    ]).then(() => self.clients.claim())
  );
});

// Initialize IndexedDB for offline setlist storage
function initOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Setlists store with indexes
      if (!db.objectStoreNames.contains(SETLIST_STORE)) {
        const store = db.createObjectStore(SETLIST_STORE, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt');
        store.createIndex('showDate', 'showDate');
      }
    };
  });
}

// Save setlist to IndexedDB for offline access
async function saveSetlistOffline(setlist) {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SETLIST_STORE, 'readwrite');
    const store = tx.objectStore(SETLIST_STORE);

    store.put({
      ...setlist,
      cachedAt: Date.now(),
    });

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Get setlist from IndexedDB
async function getOfflineSetlist(id) {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SETLIST_STORE, 'readonly');
    const store = tx.objectStore(SETLIST_STORE);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get all offline setlists
async function getAllOfflineSetlists() {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SETLIST_STORE, 'readonly');
    const store = tx.objectStore(SETLIST_STORE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Fetch event - apply caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // Skip WebSocket connections
  if (url.pathname.includes('/socket') || url.pathname.includes('/ably')) return;

  // Determine strategy
  const strategy = getStrategy(url);

  switch (strategy) {
    case 'cacheFirst':
      event.respondWith(cacheFirst(request));
      break;
    case 'networkFirst':
      event.respondWith(networkFirst(request));
      break;
    case 'staleWhileRevalidate':
      event.respondWith(staleWhileRevalidate(request));
      break;
    default:
      event.respondWith(networkFirst(request));
  }
});

// Determine which strategy to use
function getStrategy(url) {
  const urlString = url.href;

  for (const pattern of CACHE_STRATEGIES.cacheFirst) {
    if (pattern.test(urlString)) return 'cacheFirst';
  }

  for (const pattern of CACHE_STRATEGIES.networkFirst) {
    if (pattern.test(urlString)) return 'networkFirst';
  }

  for (const pattern of CACHE_STRATEGIES.staleWhileRevalidate) {
    if (pattern.test(urlString)) return 'staleWhileRevalidate';
  }

  return 'networkFirst';
}

// Cache-first strategy (for static assets)
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first fetch failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network-first strategy (for API calls)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful GET requests to API
    if (networkResponse.ok && request.url.includes('/api/')) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, checking cache...');

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline');
      if (offlinePage) return offlinePage;
    }

    return new Response(JSON.stringify({ error: 'Offline', offline: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Stale-while-revalidate strategy (for pages)
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.log('[SW] SWR network failed:', error);
      return null;
    });

  // Return cached version immediately, update in background
  if (cachedResponse) {
    // Trigger background update
    fetchPromise;
    return cachedResponse;
  }

  // No cache, wait for network
  const networkResponse = await fetchPromise;

  if (networkResponse) {
    return networkResponse;
  }

  // Offline fallback
  const offlinePage = await caches.match('/offline');
  if (offlinePage) return offlinePage;

  return new Response('Offline', { status: 503 });
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-pending-actions') {
    event.waitUntil(syncPendingActions());
  }
});

// Sync pending actions when back online
async function syncPendingActions() {
  try {
    const cache = await caches.open('pending-actions');
    const requests = await cache.keys();

    for (const request of requests) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.delete(request);
          console.log('[SW] Synced pending action:', request.url);
        }
      } catch (error) {
        console.error('[SW] Failed to sync action:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body || "New notification from Rock N' Roll Basement",
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Rock N' Roll Basement", options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Message handler for offline setlist operations
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  switch (type) {
    case 'SAVE_SETLIST_OFFLINE':
      // Save setlist for offline performer mode
      saveSetlistOffline(payload)
        .then(() => {
          event.ports[0]?.postMessage({ success: true });
          console.log('[SW] Setlist saved offline:', payload.id);
        })
        .catch((error) => {
          event.ports[0]?.postMessage({ success: false, error: error.message });
          console.error('[SW] Failed to save setlist offline:', error);
        });
      break;

    case 'GET_OFFLINE_SETLIST':
      // Retrieve setlist from offline storage
      getOfflineSetlist(payload.id)
        .then((setlist) => {
          event.ports[0]?.postMessage({ success: true, setlist });
        })
        .catch((error) => {
          event.ports[0]?.postMessage({ success: false, error: error.message });
        });
      break;

    case 'GET_ALL_OFFLINE_SETLISTS':
      // Get all offline setlists
      getAllOfflineSetlists()
        .then((setlists) => {
          event.ports[0]?.postMessage({ success: true, setlists });
        })
        .catch((error) => {
          event.ports[0]?.postMessage({ success: false, error: error.message });
        });
      break;

    case 'DELETE_OFFLINE_SETLIST':
      // Delete setlist from offline storage
      initOfflineDB()
        .then((db) => {
          const tx = db.transaction(SETLIST_STORE, 'readwrite');
          tx.objectStore(SETLIST_STORE).delete(payload.id);
          return new Promise((resolve, reject) => {
            tx.oncomplete = resolve;
            tx.onerror = reject;
          });
        })
        .then(() => {
          event.ports[0]?.postMessage({ success: true });
          console.log('[SW] Deleted offline setlist:', payload.id);
        })
        .catch((error) => {
          event.ports[0]?.postMessage({ success: false, error: error.message });
        });
      break;

    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    default:
      console.log('[SW] Unknown message type:', type);
  }
});

// Periodic background sync for setlist updates (when supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-setlists') {
    event.waitUntil(syncOfflineSetlists());
  }
});

// Sync offline setlists with server
async function syncOfflineSetlists() {
  try {
    const setlists = await getAllOfflineSetlists();

    for (const setlist of setlists) {
      // Check if online and setlist has been modified
      if (setlist.pendingSync) {
        try {
          const response = await fetch(`/api/setlists/${setlist.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(setlist),
          });

          if (response.ok) {
            // Clear pending sync flag
            await saveSetlistOffline({ ...setlist, pendingSync: false });
            console.log('[SW] Synced setlist:', setlist.id);
          }
        } catch (error) {
          console.error('[SW] Failed to sync setlist:', setlist.id, error);
        }
      }
    }
  } catch (error) {
    console.error('[SW] Setlist sync failed:', error);
  }
}

console.log('[SW] Service worker loaded with offline setlist support');
