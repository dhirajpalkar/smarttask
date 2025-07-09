const CACHE_NAME = "smarttask-v1.0.0"
const STATIC_CACHE_NAME = "smarttask-static-v1.0.0"
const DYNAMIC_CACHE_NAME = "smarttask-dynamic-v1.0.0"

// Assets to cache immediately
const STATIC_ASSETS = ["/", "/manifest.json", "/icon-192x192.png", "/icon-512x512.png"]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...")

  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching static assets")
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log("Service Worker: Static assets cached")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("Service Worker: Error caching static assets", error)
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...")

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME && cacheName !== CACHE_NAME) {
              console.log("Service Worker: Deleting old cache", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("Service Worker: Activated")
        return self.clients.claim()
      }),
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith("http")) {
    return
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request))
    return
  }

  // Handle static assets with cache-first strategy
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Handle navigation requests with network-first, cache fallback
  if (request.mode === "navigate") {
    event.respondWith(networkFirstWithOfflineFallback(request))
    return
  }

  // Default: cache-first for other requests
  event.respondWith(cacheFirst(request))
})

// Cache-first strategy
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error("Cache-first strategy failed:", error)
    return new Response("Offline - Content not available", {
      status: 503,
      statusText: "Service Unavailable",
    })
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log("Network failed, trying cache:", error)
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    throw error
  }
}

// Network-first with offline fallback for navigation
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log("Network failed for navigation, trying cache:", error)

    // Try to serve cached version of the page
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Fallback to cached root page
    const rootCache = await caches.match("/")
    if (rootCache) {
      return rootCache
    }

    // Ultimate fallback - offline page
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SmartTask - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: system-ui, sans-serif; 
              text-align: center; 
              padding: 2rem;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0;
            }
            .container {
              background: rgba(255,255,255,0.1);
              padding: 2rem;
              border-radius: 1rem;
              backdrop-filter: blur(10px);
            }
            h1 { margin-bottom: 1rem; }
            p { opacity: 0.9; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📱 SmartTask</h1>
            <h2>You're Offline</h2>
            <p>Please check your internet connection and try again.</p>
            <button onclick="window.location.reload()" 
                    style="margin-top: 1rem; padding: 0.5rem 1rem; 
                           background: rgba(255,255,255,0.2); 
                           border: 1px solid rgba(255,255,255,0.3); 
                           color: white; border-radius: 0.5rem; cursor: pointer;">
              Try Again
            </button>
          </div>
        </body>
      </html>
    `,
      {
        headers: { "Content-Type": "text/html" },
      },
    )
  }
}

// Helper function to identify static assets
function isStaticAsset(pathname) {
  const staticExtensions = [".js", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2"]
  return (
    staticExtensions.some((ext) => pathname.endsWith(ext)) ||
    pathname.includes("/_next/static/") ||
    pathname === "/manifest.json"
  )
}

// Background sync for offline task management
self.addEventListener("sync", (event) => {
  console.log("Service Worker: Background sync triggered", event.tag)

  if (event.tag === "task-sync") {
    event.waitUntil(syncTasks())
  }
})

// Sync tasks when back online
async function syncTasks() {
  try {
    console.log("Service Worker: Syncing tasks...")
    // This would integrate with your task storage system
    // For now, we'll just log that sync is happening

    // In a real implementation, you would:
    // 1. Get pending tasks from IndexedDB
    // 2. Send them to your API
    // 3. Update local storage with server response
    // 4. Notify the main thread of sync completion

    const clients = await self.clients.matchAll()
    clients.forEach((client) => {
      client.postMessage({
        type: "SYNC_COMPLETE",
        message: "Tasks synced successfully",
      })
    })
  } catch (error) {
    console.error("Service Worker: Task sync failed", error)
  }
}

// Push notification handling
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push notification received")

  const options = {
    body: event.data ? event.data.text() : "You have pending tasks!",
    icon: "/icon-192x192.png",
    badge: "/icon-72x72.png",
    vibrate: [200, 100, 200],
    data: {
      url: "/",
    },
    actions: [
      {
        action: "view",
        title: "View Tasks",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("SmartTask", options))
})

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification clicked", event.action)

  event.notification.close()

  if (event.action === "view") {
    event.waitUntil(clients.openWindow("/"))
  }
})

// Message handling from main thread
self.addEventListener("message", (event) => {
  console.log("Service Worker: Message received", event.data)

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

// Periodic background sync for task reminders
self.addEventListener("periodicsync", (event) => {
  console.log("Service Worker: Periodic sync triggered", event.tag)

  if (event.tag === "task-reminders") {
    event.waitUntil(checkTaskReminders())
  }
})

// Check for overdue tasks and send notifications
async function checkTaskReminders() {
  try {
    // This would check localStorage for overdue tasks
    // and send appropriate notifications
    console.log("Service Worker: Checking task reminders...")

    // In a real implementation, you would:
    // 1. Read tasks from localStorage/IndexedDB
    // 2. Check for overdue or upcoming due dates
    // 3. Send push notifications for important tasks
  } catch (error) {
    console.error("Service Worker: Task reminder check failed", error)
  }
}
