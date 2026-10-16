const CACHE_NAME = "flegrei-match-pwa-v8";

const INITIAL_ASSETS = [
  "./",
  "./index.html",
  "./CentriSportivi.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "https://cdn.tailwindcss.com",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(INITIAL_ASSETS).catch(() => {}))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  // CRUCIALE PER LA VELOCITÀ: non intercettare mai le chiamate di Firebase, Google Auth o Firestore!
  // Intercettare queste chiamate con cache o wrapper causava timeout e ritardi di 1-2 minuti.
  if (
    url.hostname.includes("firebase") ||
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("google.com") ||
    url.hostname.includes("gstatic.com") && url.pathname.includes("/firebasejs/") ||
    url.hostname.includes("identitytoolkit") ||
    url.hostname.includes("firestore")
  ) {
    return; // Passa direttamente alla rete senza bloccare
  }

  // Cache per OpenStreetMap e Satellite Esri
  if (url.hostname.includes("tile.openstreetmap.org") || url.hostname.includes("arcgisonline.com")) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            })
            .catch(() => cachedResponse);
          return cachedResponse || fetchPromise;
        })
      )
    );
    return;
  }

  // Strategia per asset statici locali dell'app
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});

// GESTIONE NOTIFICHE PUSH (Firebase Cloud Messaging / Web Push)
self.addEventListener("push", (event) => {
  let data = { title: "Flegrea Match", body: "Nuovo aggiornamento sulle partite!" };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "Flegrea Match", body: event.data.text() };
    }
  }

  const notificationTitle = data.title || (data.notification ? data.notification.title : "Flegrea Match");
  const notificationOptions = {
    body: data.body || (data.notification ? data.notification.body : "Hai una novità su Flegrea Match"),
    icon: "./icon-192.png",
    badge: "./icon-192.png",
    vibrate: [200, 100, 200],
    data: {
      url: data.url || (data.data ? data.data.url : "./index.html")
    }
  };

  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : "./index.html";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("index.html") && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});