export type GoShortcut = { key: string; to: string; label: string };

export const GO_SHORTCUTS: GoShortcut[] = [
  { key: "h", to: "/app", label: "Home" },
  { key: "a", to: "/app/analytics", label: "Website analytics" },
  { key: "d", to: "/app/dashboards", label: "Dashboards" },
  { key: "g", to: "/app/goals", label: "Goals" },
  { key: "j", to: "/app/journey", label: "User journeys" },
  { key: "v", to: "/app/search-visibility", label: "Search visibility" },
  { key: "s", to: "/app/seo", label: "SEO" },
  { key: "c", to: "/app/compare", label: "Compare" },
  { key: "r", to: "/app/reports", label: "Reports" },
  { key: "p", to: "/app/social", label: "Scheduled posts" },
  { key: "l", to: "/app/lead-capture", label: "Lead capture" },
  { key: "o", to: "/app/orbit", label: "Orbit" },
  { key: "m", to: "/app/members", label: "Members" },
  { key: "b", to: "/app/billing", label: "Billing" },
  { key: ",", to: "/app/settings", label: "Settings" },
];

export const GO_MAP = new Map(GO_SHORTCUTS.map((s) => [s.key, s]));

export const GO_BY_PATH = new Map(GO_SHORTCUTS.map((s) => [s.to, s.key]));

export type ShortcutRow = { keys: string[]; label: string };

export const GLOBAL_SHORTCUTS: ShortcutRow[] = [
  { keys: ["Ctrl", "K"], label: "Open command palette" },
  { keys: ["?"], label: "Show keyboard shortcuts" },
  { keys: ["N"], label: "Open notes" },
  { keys: ["Ctrl", "1–9"], label: "Switch workspace" },
  { keys: ["Esc"], label: "Close dialog or panel" },
];
