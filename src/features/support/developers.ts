import type { ApiKey, ApiKeyUsageWindow } from "@/shared/types";

export const DOCS_URL = "https://quantalog.daorbit.in/docs/platform-api";

export const KEY_ENV_VAR = "QUANTALOG_API_KEY";

const DAY_MS = 24 * 60 * 60 * 1000;

export const EXPIRING_SOON_DAYS = 7;

export const EXPIRY_OPTIONS = ["never", "7", "30", "60", "90", "180", "365"] as const;
export type ExpiryOption = (typeof EXPIRY_OPTIONS)[number];

export function expiryDays(option: ExpiryOption): number | null {
  return option === "never" ? null : Number(option);
}

export function expiryDate(option: ExpiryOption): Date | null {
  const days = expiryDays(option);
  return days === null ? null : new Date(Date.now() + days * DAY_MS);
}

export type KeyStatus = "active" | "expiring" | "expired";

export function keyStatus(key: Pick<ApiKey, "expiresAt">): KeyStatus {
  if (!key.expiresAt) return "active";
  const left = new Date(key.expiresAt).getTime() - Date.now();
  if (left <= 0) return "expired";
  if (left <= EXPIRING_SOON_DAYS * DAY_MS) return "expiring";
  return "active";
}

export function latestUse(keys: Pick<ApiKey, "lastUsedAt">[]): string | undefined {
  return keys.reduce<string | undefined>(
    (latest, k) =>
      k.lastUsedAt && (!latest || new Date(k.lastUsedAt) > new Date(latest)) ? k.lastUsedAt : latest,
    undefined,
  );
}

export function daysUntil(date: string): number {
  return Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / DAY_MS));
}

export const USAGE_WINDOWS: ApiKeyUsageWindow[] = [7, 30, 90];

export function percentDelta(current: number, previous: number): number | null {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export function successRate(requests: number, failures: number): string {
  if (!requests) return "—";
  const rate = ((requests - failures) / requests) * 100;
  return `${rate >= 99.95 ? "100" : rate.toFixed(1)}%`;
}

export function usageDayLabel(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

const LOCAL_API = "http://localhost:4000";

export function apiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE as string | undefined;
  const base = configured || (import.meta.env.DEV ? LOCAL_API : window.location.origin);
  return base.replace(/\/$/, "");
}

export function playgroundUrl(): string {
  return `${apiBaseUrl()}/docs/`;
}

export function maskedKey(prefix: string): string {
  return `${prefix}${"•".repeat(12)}`;
}

export type SnippetLang = "curl" | "node" | "python";

export interface Snippet {
  id: SnippetLang;
  label: string;
  filename: string;
  code: string;
}

export function quickStartSnippets(base: string): Snippet[] {
  const url = `${base}/v1/projects`;
  return [
    {
      id: "curl",
      label: "cURL",
      filename: "terminal",
      code: `curl ${url} \\\n  -H "Authorization: Bearer $${KEY_ENV_VAR}"`,
    },
    {
      id: "node",
      label: "Node.js",
      filename: "index.js",
      code: `const res = await fetch("${url}", {\n  headers: {\n    Authorization: \`Bearer \${process.env.${KEY_ENV_VAR}}\`,\n  },\n});\n\nconst projects = await res.json();\nconsole.log(projects);`,
    },
    {
      id: "python",
      label: "Python",
      filename: "main.py",
      code: `import os\nimport requests\n\nres = requests.get(\n    "${url}",\n    headers={"Authorization": f"Bearer {os.environ['${KEY_ENV_VAR}']}"},\n)\n\nprint(res.json())`,
    },
  ];
}

export const SAMPLE_RESPONSE = `[\n  {\n    "_id": "66f1c2a9e4b0a1d2c3f4e5a6",\n    "workspaceId": "66e0b1a8d3c2f1e0a9b8c7d6",\n    "name": "Acme storefront",\n    "extUserId": "user_1042",\n    "createdAt": "2026-09-01T10:24:00.000Z"\n  }\n]`;
