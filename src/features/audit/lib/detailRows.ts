import type { AuditEntry } from "@/shared/types";

const META_LABELS: Record<string, string> = {
  role: "Role",
  count: "Count",
  method: "Sign-in method",
  domain: "Domain",
  enabled: "Turned on",
  rotated: "Link reset",
  prefix: "Key prefix",
  expiresInDays: "Expires in (days)",
  provider: "Provider",
  mode: "Mode",
  credentialsChanged: "Keys changed",
  submissionId: "Response ID",
  sourceId: "Copied from",
  route: "Route",
};

const KIND_LABELS: Record<string, string> = {
  api_key: "API key",
  search_console: "Search Console",
  seo: "SEO report",
};

const CHANGE_KEYS = new Set(["from", "to"]);

function humanize(key: string) {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ").replace(/^./, (c) => c.toUpperCase());
}

function display(value: string | number | boolean) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

export function metaRows(entry: AuditEntry) {
  return Object.entries(entry.meta)
    .filter(([key, value]) => !CHANGE_KEYS.has(key) && value !== "" && value !== 0)
    .map(([key, value]) => ({ key: META_LABELS[key] ?? humanize(key), value: display(value) }));
}

export function changeOf(entry: AuditEntry): { from: string; to: string } | null {
  const { from, to } = entry.meta;
  if (from === undefined || to === undefined) return null;
  const cap = (v: unknown) => {
    const text = String(v);
    return entry.action === "member.role_changed" ? text.charAt(0).toUpperCase() + text.slice(1) : text;
  };
  return { from: cap(from), to: cap(to) };
}

export function kindLabel(kind: string) {
  return KIND_LABELS[kind] ?? humanize(kind || "workspace");
}
