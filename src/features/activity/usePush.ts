import { useCallback, useEffect, useState } from "react";
import {
  useSubscribeToPushMutation,
  useUnsubscribeFromPushMutation,
  useSendTestPushMutation,
} from "@/app/store";

/**
 * Browser push: permission, registration, and the switch that turns it on.
 *
 * Push is the one part of the notification system that can be unavailable for
 * reasons the product does not control — an unsupported browser, a permission
 * the user denied months ago, a deployment with no VAPID keys. So everything
 * here reports a state rather than throwing, and the settings screen renders
 * whichever explanation applies instead of a switch that would not work.
 *
 * Worth knowing about iOS: Safari supports push only for a site the user has
 * added to their home screen. On an ordinary iOS tab `supported` is false, and
 * that is the browser's rule rather than something this code can work around.
 */

export type PushState =
  /** No service worker or PushManager — nothing to offer. */
  | "unsupported"
  /** The deployment has no VAPID keys configured. */
  | "unconfigured"
  /** Supported and available, but this browser is not registered. */
  | "off"
  /** Registered and receiving. */
  | "on"
  /** The user refused permission. Only they can undo this, in browser settings. */
  | "denied"
  /** A registration or permission request is in flight. */
  | "working";

function supported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * The VAPID public key travels as base64url in JSON and has to reach
 * `subscribe()` as a Uint8Array. Neither end of that is negotiable, so the
 * conversion lives here.
 */
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalised = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(normalised);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

/**
 * Register the worker, or reuse the existing registration.
 *
 * `/sw.js` is served from the site root so its scope covers the whole app —
 * a worker registered from a subdirectory could only receive pushes for pages
 * beneath it.
 */
async function registration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration("/");
  if (existing) return existing;
  return navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

function sameServerKey(sub: PushSubscription, vapidPublicKey: string): boolean {
  const current = sub.options?.applicationServerKey;
  if (!current) return true;
  const a = new Uint8Array(current);
  const b = urlBase64ToUint8Array(vapidPublicKey);
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function subscriptionBody(sub: PushSubscription) {
  const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return null;
  return { endpoint: json.endpoint, keys: { p256dh: json.keys.p256dh, auth: json.keys.auth } };
}

export function usePush(vapidPublicKey: string, pushConfigured: boolean) {
  const [state, setState] = useState<PushState>("unsupported");
  const [subscribe] = useSubscribeToPushMutation();
  const [unsubscribe] = useUnsubscribeFromPushMutation();
  const [sendTestPush, { isLoading: testing }] = useSendTestPushMutation();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!supported()) return setState("unsupported");
      if (!pushConfigured || !vapidPublicKey) return setState("unconfigured");
      if (Notification.permission === "denied") return setState("denied");

      try {
        const reg = await registration();
        let existing = await reg.pushManager.getSubscription();

        if (existing && !sameServerKey(existing, vapidPublicKey)) {
          await existing.unsubscribe();
          existing =
            Notification.permission === "granted"
              ? await reg.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
                })
              : null;
        }

        const body = existing ? subscriptionBody(existing) : null;
        if (body) await subscribe(body).unwrap().catch(() => {});

        if (!cancelled) setState(body ? "on" : "off");
      } catch {
        // A worker that will not register means push cannot work here, whatever
        // the reason — treat it as unsupported rather than offering a switch
        // that fails on click.
        if (!cancelled) setState("unsupported");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pushConfigured, vapidPublicKey, subscribe]);

  const enable = useCallback(async () => {
    if (!supported() || !vapidPublicKey) return;
    setState("working");

    try {
      // Asked only when the user has actively turned the switch on. A
      // permission prompt on page load is the fastest way to get permanently
      // denied, and denial is not reversible from here.
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "off");
        return;
      }

      const reg = await registration();
      const sub = await reg.pushManager.subscribe({
        // Required by every browser that implements push: a payload the user
        // cannot see is not allowed.
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });

      const body = subscriptionBody(sub);
      if (!body) {
        setState("off");
        return;
      }

      await subscribe(body).unwrap();

      setState("on");
    } catch {
      setState("off");
    }
  }, [subscribe, vapidPublicKey]);

  const disable = useCallback(async () => {
    setState("working");
    try {
      const reg = await registration();
      const existing = await reg.pushManager.getSubscription();

      if (existing) {
        // The server is told first: a registration dropped locally but left on
        // the server would keep receiving pushes that land nowhere, and the row
        // would only be cleaned up when a send finally failed against it.
        await unsubscribe({ endpoint: existing.endpoint }).unwrap().catch(() => {});
        await existing.unsubscribe();
      }

      setState("off");
    } catch {
      setState("off");
    }
  }, [unsubscribe]);

  const sendTest = useCallback(() => sendTestPush().unwrap(), [sendTestPush]);

  return { state, enable, disable, sendTest, testing };
}
