import { api } from "@/shared/lib/http";
import { clearPushSync, markPushSynced, needsPushSync, pushSyncKey, pushSyncOwner } from "./pushSync";

export const SW_URL = "/sw.js";
const UNSUBSCRIBE_PATH = "/api/notifications/push/unsubscribe";

export type SubscriptionBody = { endpoint: string; keys: { p256dh: string; auth: string } };
type SubscribeFn = (body: SubscriptionBody) => Promise<unknown>;

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function isOurWorker(reg: ServiceWorkerRegistration): boolean {
  const worker = reg.active ?? reg.waiting ?? reg.installing;
  return Boolean(worker && new URL(worker.scriptURL).pathname === SW_URL);
}

export function subscriptionBody(sub: PushSubscription): SubscriptionBody | null {
  const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return null;
  return { endpoint: json.endpoint, keys: { p256dh: json.keys.p256dh, auth: json.keys.auth } };
}

export async function currentSubscription(): Promise<PushSubscription | null> {
  if (!pushSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration("/");
  return reg && isOurWorker(reg) ? reg.pushManager.getSubscription() : null;
}

export async function linkSubscription(
  sub: PushSubscription,
  userId: string | undefined,
  subscribe: SubscribeFn,
): Promise<boolean> {
  const body = subscriptionBody(sub);
  if (!body) return false;
  if (!userId) return true;

  const owner = pushSyncOwner();
  if (owner && owner !== userId) {
    await sub.unsubscribe().catch(() => false);
    clearPushSync();
    return false;
  }

  const key = pushSyncKey(userId, body.endpoint);
  if (needsPushSync(key)) {
    const synced = await subscribe(body).then(() => true, () => false);
    if (synced) markPushSynced(key);
  }
  return true;
}

export function markSubscriptionLinked(userId: string | undefined, endpoint: string) {
  markPushSynced(pushSyncKey(userId, endpoint));
}

export async function releasePushSubscription(): Promise<void> {
  const sub = await currentSubscription().catch(() => null);
  if (!sub) return;
  await api.post(UNSUBSCRIBE_PATH, { endpoint: sub.endpoint }).catch(() => undefined);
}
