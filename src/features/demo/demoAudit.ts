import type { AuditCategory, AuditEntry, AuditPage, WorkspaceAuditPage } from "@/shared/types";

const now = Date.now();
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const avatar = (seed: string) => `https://i.pravatar.cc/100?u=${seed}`;

const PEOPLE = {
  you: { id: "demo-user-you", name: "Alex Morgan", email: "alex@acme.example", avatarUrl: avatar("demo-alex-morgan"), deleted: false },
  priya: { id: "demo-user-priya", name: "Priya Shah", email: "priya@acme.example", avatarUrl: avatar("demo-priya-shah"), deleted: false },
  marcus: { id: "demo-user-marcus", name: "Marcus Webb", email: "marcus@acme.example", avatarUrl: avatar("demo-marcus-webb"), deleted: false },
  hinata: { id: "demo-user-hinata", name: "Hinata Tachibana", email: "hinata@acme.example", avatarUrl: avatar("demo-hinata-tachibana"), deleted: false },
};

type Seed = {
  action: string;
  category: AuditCategory;
  ago: number;
  actor: keyof typeof PEOPLE;
  target?: Partial<AuditEntry["target"]>;
  meta?: AuditEntry["meta"];
  source?: AuditEntry["source"];
  device?: [string, string, string];
};

const DEVICES: Record<keyof typeof PEOPLE, [string, string, string]> = {
  you: ["Chrome", "macOS", "Bengaluru, India"],
  priya: ["Safari", "iOS", "Mumbai, India"],
  marcus: ["Firefox", "Windows", "London, United Kingdom"],
  hinata: ["Edge", "Windows", "Tokyo, Japan"],
};

function entry(seed: Seed, i: number): AuditEntry {
  const [browser, os, location] = seed.device ?? DEVICES[seed.actor];
  return {
    id: `demo-audit-${i}`,
    action: seed.action,
    category: seed.category,
    createdAt: new Date(now - seed.ago).toISOString(),
    actor: PEOPLE[seed.actor],
    viaSupport: false,
    target: { kind: "", id: "", label: "", ...seed.target },
    meta: seed.meta ?? {},
    source: seed.source ?? "dashboard",
    ip: "",
    location,
    browser,
    os,
  };
}

const WORKSPACE_SEEDS: Seed[] = [
  { action: "form.published", category: "forms", ago: 18 * MIN, actor: "marcus", target: { kind: "form", label: "Webinar sign-up" }, source: "forms" },
  { action: "form.submissions_deleted", category: "forms", ago: 52 * MIN, actor: "priya", target: { kind: "form", label: "Contact us" }, meta: { count: 14 }, source: "forms" },
  { action: "member.role_changed", category: "members", ago: 3 * HOUR, actor: "you", target: { kind: "member", label: "Marcus Webb" }, meta: { from: "viewer", to: "editor" } },
  { action: "api_key.created", category: "developers", ago: 5 * HOUR, actor: "priya", target: { kind: "api_key", label: "Warehouse sync" } },
  { action: "goal.deleted", category: "analytics", ago: 7 * HOUR, actor: "marcus", target: { kind: "goal", label: "1,000 sign-ups in October" } },
  { action: "dashboard.created", category: "analytics", ago: 20 * HOUR, actor: "priya", target: { kind: "dashboard", label: "Launch week" } },
  { action: "competitor.added", category: "seo", ago: 2 * DAY, actor: "marcus", target: { kind: "competitor", label: "northwind.io" } },
  { action: "member.invited", category: "members", ago: DAY + 2 * HOUR, actor: "you", target: { kind: "invite", label: "diego@northwind.io" }, meta: { role: "editor" } },
  { action: "form.payments_updated", category: "forms", ago: DAY + 4 * HOUR, actor: "priya", target: { kind: "payments", label: "razorpay" }, meta: { provider: "razorpay", credentialsChanged: true }, source: "forms" },
  { action: "workspace.share_updated", category: "workspace", ago: DAY + 6 * HOUR, actor: "you", meta: { enabled: true, rotated: false } },
  { action: "site.added", category: "sites", ago: 3 * DAY, actor: "marcus", target: { kind: "site", label: "Acme docs" }, meta: { domain: "docs.acme.example" } },
  { action: "member.joined", category: "members", ago: 4 * DAY, actor: "hinata", meta: { role: "viewer" } },
  { action: "form.app_connected", category: "forms", ago: 5 * DAY, actor: "marcus", target: { kind: "app", id: "slack", label: "slack" }, source: "forms" },
  { action: "api_key.revoked", category: "developers", ago: 6 * DAY, actor: "priya", target: { kind: "api_key", label: "Old Zapier key" } },
];

const ACCOUNT_SEEDS: Seed[] = [
  { action: "account.login", category: "account", ago: 25 * MIN, actor: "you", meta: { method: "password" } },
  { action: "account.session_revoked", category: "account", ago: 2 * DAY, actor: "you", target: { kind: "session", label: "Safari · iOS" } },
  { action: "account.2fa_enabled", category: "account", ago: 9 * DAY, actor: "you" },
  { action: "account.login", category: "account", ago: 9 * DAY + HOUR, actor: "you", meta: { method: "google" }, device: ["Safari", "iOS", "Pune, India"] },
  { action: "account.password_changed", category: "account", ago: 21 * DAY, actor: "you" },
];

const WORKSPACE_ENTRIES = [...WORKSPACE_SEEDS].sort((a, b) => a.ago - b.ago).map(entry);
const ACCOUNT_ENTRIES = ACCOUNT_SEEDS.map(entry);

const DEMO_SUMMARY = {
  total: WORKSPACE_ENTRIES.length,
  people: new Set(WORKSPACE_ENTRIES.map((e) => e.actor?.id)).size,
  lastAt: WORKSPACE_ENTRIES[0].createdAt,
  byCategory: WORKSPACE_ENTRIES.reduce<Partial<Record<AuditCategory, number>>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + 1;
    return acc;
  }, {}),
};

export function demoAuditPage(category: AuditCategory | null = null): WorkspaceAuditPage {
  return {
    items: category ? WORKSPACE_ENTRIES.filter((e) => e.category === category) : WORKSPACE_ENTRIES,
    nextCursor: null,
    summary: DEMO_SUMMARY,
    retention: { days: 365, plan: "Pro", upgradable: false },
  };
}

export function demoAccountActivity(): AuditPage {
  return { items: ACCOUNT_ENTRIES, nextCursor: null };
}
