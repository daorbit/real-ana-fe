 
const FALLBACK_TITLE = "Quantalog";

self.addEventListener("install", () => {
 
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
 
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }

  const title = payload.title || FALLBACK_TITLE;
  const options = {
    body: payload.body || "",
    icon: "/favicon.png",
    badge: "/favicon.png",
    // Where the click handler below should navigate to.
    data: { link: payload.link || "/app", notificationId: payload.notificationId || "" },
 
    tag: payload.notificationId || undefined,
    renotify: Boolean(payload.notificationId),
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const link = (event.notification.data && event.notification.data.link) || "/app";

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

 
      for (const client of clientList) {
        if ("focus" in client) {
          await client.focus();
          if ("navigate" in client) {
            try {
              await client.navigate(link);
            } catch {
              // Cross-origin or otherwise refused — a focused tab on the wrong
              // page still beats a new window.
            }
          }
          return;
        }
      }

      if (self.clients.openWindow) await self.clients.openWindow(link);
    })(),
  );
});
