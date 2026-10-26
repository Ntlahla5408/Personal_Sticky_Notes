const CACHE = "personal-sticky-notes-v4";
const ASSETS = ["./", "./index.html", "./styles.css", "./app.js", "./curated-notes.js", "./manifest.webmanifest"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("personal-sticky-notes-") && key !== CACHE).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("push", event => {
  let message = {
    title: "A little tech surprise is waiting",
    body: "Open Little Notes for a small discovery.",
    tag: "little-notes-surprise",
    data: { url: "./?surprise=1" }
  };
  if (event.data) {
    try { message = { ...message, ...event.data.json() }; }
    catch { message.body = event.data.text() || message.body; }
  }
  const safeUrl = (() => {
    try {
      const url = new URL(message.data?.url || "./?surprise=1", self.location.href);
      return url.origin === self.location.origin ? url.href : self.registration.scope + "?surprise=1";
    } catch {
      return self.registration.scope + "?surprise=1";
    }
  })();
  event.waitUntil(self.registration.showNotification(message.title || "Little Notes", {
    body: message.body || "A small discovery is waiting for you.",
    tag: message.tag || "little-notes-surprise",
    icon: "./icons/icon-192.png",
    badge: "./icons/icon-192.png",
    renotify: false,
    data: { url: safeUrl }
  }));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || (self.registration.scope + "?surprise=1");
  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of clients) {
      if (new URL(client.url).origin === self.location.origin && "focus" in client) {
        if ("navigate" in client && client.url !== targetUrl) await client.navigate(targetUrl);
        return client.focus();
      }
    }
    return self.clients.openWindow(targetUrl);
  })());
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok && new URL(event.request.url).origin === self.location.origin) {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
    }
    return response;
  }).catch(() => caches.match("./index.html"))));
});
