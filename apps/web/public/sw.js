/**
 * Service Worker for Rock N' Roll Basement
 * Handles offline support, push notifications, and background sync
 */

const CACHE_VERSION = 'v4-pwa-fix'; // Fixed PWA navigation issues
const STATIC_CACHE = `rnrb-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `rnrb-dynamic-${CACHE_VERSION}`;
const API_CACHE = `rnrb-api-${CACHE_VERSION}`;

// Static assets to cache on install (app shell)
// NOTE: Only cache truly static assets, NOT HTML pages
// HTML pages should always go through network-first to ensure fresh content
const STATIC_ASSETS = [
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/logo-dark.png',
  '/logo-light.png',
  '/apple-touch-icon.png',
];

// The offline page URL - fetched dynamically when needed
const OFFLINE_PAGE = '/offline';

// API routes to cache with network-first strategy
const CACHEABLE_API_ROUTES = [
  '/api/trpc/user.me',
  '/api/trpc/project.list',
  '/api/trpc/song.list',
  '/api/trpc/notification.list',
];

// Maximum age for cached API responses (5 minutes)
const API_CACHE_MAX_AGE = 5 * 60 * 1000;

// Install event - cache static assets and activate immediately
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker version:', CACHE_VERSION);

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets...');
        // Add assets one by one to prevent single failure from blocking all
        return Promise.allSettled(
          STATIC_ASSETS.map((url) =>
            cache.add(url).catch((err) => {
              console.warn('[SW] Failed to cache:', url, err);
            })
          )
        );
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        // CRITICAL: Skip waiting to activate immediately
        // This ensures users get the latest service worker
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] Install failed:', err);
        // Still skip waiting even on error to prevent stale SW
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker version:', CACHE_VERSION);

  event.waitUntil(
    (async () => {
      // Delete ALL old caches first
      const cacheNames = await caches.keys();
      const deletePromises = cacheNames
        .filter((name) => {
          // Delete any cache that doesn't match current version
          return (
            name.startsWith('rnrb-') &&
            name !== STATIC_CACHE &&
            name !== DYNAMIC_CACHE &&
            name !== API_CACHE
          );
        })
        .map((name) => {
          console.log('[SW] Deleting old cache:', name);
          return caches.delete(name);
        });

      await Promise.all(deletePromises);

      console.log('[SW] Old caches cleaned up');

      // CRITICAL: Claim all clients immediately
      // This makes the new service worker take over all tabs/windows
      await self.clients.claim();

      console.log('[SW] Service worker activated and claimed all clients');

      // Notify all clients that there's a new version
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => {
        client.postMessage({
          type: 'SW_UPDATED',
          version: CACHE_VERSION,
        });
      });
    })()
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip Next.js HMR/hot reload requests in development
  if (url.pathname.includes('/_next/webpack-hmr') || url.pathname.includes('/__nextjs')) {
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Handle static assets with cache-first strategy
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Handle navigation requests (HTML pages) with STRICT network-first
  // This is critical for PWA mode - always try network first for pages
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstForNavigation(request));
    return;
  }

  // Handle _next/static assets with cache-first (these are content-hashed)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Default: network-first for everything else to ensure fresh content
  event.respondWith(networkFirstStrategy(request));
});

// Cache-first strategy (for static assets)
async function cacheFirstStrategy(request) {
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
    console.error('[SW] Cache-first failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network-first strategy (for API calls)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful API responses
    if (networkResponse.ok && isCacheableApiRoute(request.url)) {
      const cache = await caches.open(API_CACHE);
      const responseToCache = networkResponse.clone();

      // Add timestamp header for cache invalidation
      const headers = new Headers(responseToCache.headers);
      headers.append('sw-cached-at', Date.now().toString());

      const cachedResponse = new Response(await responseToCache.blob(), {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers,
      });

      cache.put(request, cachedResponse);
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);

    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      // Check if cached response is still valid
      const cachedAt = cachedResponse.headers.get('sw-cached-at');
      if (cachedAt) {
        const age = Date.now() - parseInt(cachedAt, 10);
        if (age > API_CACHE_MAX_AGE) {
          console.log('[SW] Cached API response expired');
        }
      }
      return cachedResponse;
    }

    // Return offline JSON response for API calls
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: 'You are currently offline. This data will sync when you reconnect.',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Network-first for navigation - CRITICAL for PWA
// Always fetch from network, only fall back to cache when truly offline
async function networkFirstForNavigation(request) {
  try {
    // Always try network first with a reasonable timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const networkResponse = await fetch(request, {
      signal: controller.signal,
      // Force fresh request, bypass browser cache
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    // Only cache if response is good
    if (networkResponse.ok) {
      // Don't cache navigation responses aggressively in PWA mode
      // Just let the browser handle it
      const cache = await caches.open(DYNAMIC_CACHE);
      // Clone and cache for offline fallback only
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Navigation failed, trying cache:', request.url);

    // Only fall back to cache when we're truly offline
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Serving cached version for:', request.url);
      return cachedResponse;
    }

    // Try to serve offline page (if previously cached from a successful visit)
    const offlinePage = await caches.match(OFFLINE_PAGE);
    if (offlinePage) {
      return offlinePage;
    }

    return new Response(
      `<!DOCTYPE html>
      <html>
        <head><title>Offline - Rock N' Roll Basement</title></head>
        <body style="font-family: system-ui; text-align: center; padding: 50px; background: #000; color: #fff;">
          <h1>You're Offline</h1>
          <p>Please check your internet connection and try again.</p>
          <button onclick="location.reload()" style="margin-top: 20px; padding: 12px 24px; background: #ff6347; color: white; border: none; border-radius: 8px; cursor: pointer;">
            Retry
          </button>
        </body>
      </html>`,
      {
        status: 503,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
}

// Stale-while-revalidate strategy (kept for reference but not used)
// We switched to network-first for better PWA experience
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse.ok) {
        try {
          const responseToCache = networkResponse.clone();
          const cache = await caches.open(DYNAMIC_CACHE);
          await cache.put(request, responseToCache);
        } catch (err) {
          console.warn('[SW] Failed to cache response:', err);
        }
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// Helper: Check if URL is a static asset
function isStaticAsset(pathname) {
  return (
    pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/) ||
    pathname.startsWith('/_next/static/')
  );
}

// Helper: Check if API route should be cached
function isCacheableApiRoute(url) {
  return CACHEABLE_API_ROUTES.some((route) => url.includes(route));
}

// ============================================
// PUSH NOTIFICATIONS
// ============================================

self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  let data = {
    title: "Rock N' Roll Basement",
    body: 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'default',
    data: {},
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = {
        title: payload.title || data.title,
        body: payload.body || data.body,
        icon: payload.icon || data.icon,
        badge: payload.badge || data.badge,
        image: payload.image,
        tag: payload.tag || data.tag,
        data: payload.data || {},
        actions: payload.actions,
        vibrate: payload.vibrate || [200, 100, 200],
        requireInteraction: payload.requireInteraction || false,
      };
    } catch (e) {
      console.error('[SW] Failed to parse push data:', e);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    image: data.image,
    tag: data.tag,
    data: data.data,
    actions: data.actions,
    vibrate: data.vibrate,
    requireInteraction: data.requireInteraction,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};
  let url = '/';

  if (data.type === 'live_start' && data.streamId) {
    url = `/live/${data.streamId}`;
  } else if (data.type === 'meeting_reminder' && data.meetingCode) {
    if (action === 'snooze') {
      setTimeout(
        () => {
          self.registration.showNotification(event.notification.title, {
            body: event.notification.body,
            icon: event.notification.icon,
            data: data,
          });
        },
        5 * 60 * 1000
      );
      return;
    }
    url = `/meet/${data.meetingCode}`;
  } else if (data.url) {
    url = data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// ============================================
// BACKGROUND SYNC
// ============================================

// Queue for offline actions
const SYNC_QUEUE = 'rnrb-sync-queue';

self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event:', event.tag);

  if (event.tag === 'sync-pending-actions') {
    event.waitUntil(syncPendingActions());
  }
});

async function syncPendingActions() {
  try {
    // Open IndexedDB to get pending actions
    const db = await openDatabase();
    const tx = db.transaction('pendingActions', 'readonly');
    const store = tx.objectStore('pendingActions');
    const actions = await getAllFromStore(store);

    console.log('[SW] Syncing', actions.length, 'pending actions');

    for (const action of actions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body,
        });

        if (response.ok) {
          // Remove from queue on success
          const deleteTx = db.transaction('pendingActions', 'readwrite');
          const deleteStore = deleteTx.objectStore('pendingActions');
          deleteStore.delete(action.id);
        }
      } catch (err) {
        console.error('[SW] Failed to sync action:', action.id, err);
      }
    }

    // Notify clients that sync is complete
    const allClients = await clients.matchAll();
    allClients.forEach((client) => {
      client.postMessage({ type: 'SYNC_COMPLETE' });
    });
  } catch (err) {
    console.error('[SW] Sync failed:', err);
  }
}

// IndexedDB helpers
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('rnrb-offline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('pendingActions')) {
        db.createObjectStore('pendingActions', { keyPath: 'id', autoIncrement: true });
      }

      if (!db.objectStoreNames.contains('cachedData')) {
        const store = db.createObjectStore('cachedData', { keyPath: 'key' });
        store.createIndex('timestamp', 'timestamp');
      }
    };
  });
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Message handler for client communication
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }

  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((names) => {
        return Promise.all(names.map((name) => caches.delete(name)));
      })
    );
  }
});

console.log('[SW] Service worker loaded');
