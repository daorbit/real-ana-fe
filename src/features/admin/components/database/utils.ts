import type { DbCollectionStats } from "@/shared/types";

export const TAIL_THRESHOLD = 0.01;

const WORDS = [
  "report", "schedules", "schedule", "plan", "purchases", "purchase", "addon",
  "packs", "pack", "social", "posts", "post", "runs", "scheduled", "competitor",
  "competitors", "snapshots", "crawl", "reports", "contact", "messages",
  "workspace", "invites", "members", "memberships", "membership", "api", "keys",
  "app", "settings", "password", "resets", "pending", "signups", "demo",
  "sessions", "starts", "seo", "sites", "users", "goals", "funnels", "segments",
  "markers", "events", "forms", "submissions", "subscriptions", "projects",
  "coupons", "plans", "connections",
];

export function prettyName(raw: string): string {
  let rest = raw.toLowerCase();
  const out: string[] = [];
  while (rest.length) {
    const hit = WORDS.find((w) => rest.startsWith(w));
    if (!hit) { out.push(rest); break; }
    out.push(hit);
    rest = rest.slice(hit.length);
  }
  return out.map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

export function bytes(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  const v = n / 1024 ** i;
  return `${v.toFixed(i === 0 ? 0 : v < 10 ? 2 : 1)} ${units[i]}`;
}

export function shortModelName(id: string): string {
  return id.split("/").pop() ?? id;
}

export const ERROR_CODE_LABELS: Record<number, string> = {
  4006: "daily neuron limit",
};

export function splitCollections(collectionStats: DbCollectionStats[], used: number) {
  const weight = (c: DbCollectionStats) => c.storageSize + c.indexSize;
  const total = used || 1;
  const sorted = [...collectionStats].sort((a, b) => weight(b) - weight(a));
  const shown: DbCollectionStats[] = [];
  const tail: DbCollectionStats[] = [];
  for (const c of sorted) {
    if (weight(c) / total >= TAIL_THRESHOLD || shown.length < 5) shown.push(c);
    else tail.push(c);
  }
  const tailBytes = tail.reduce((s, c) => s + weight(c), 0);
  return { shown, tail, tailBytes };
}
