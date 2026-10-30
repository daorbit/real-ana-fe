import type { PaidAppId, WorkspaceAppId, WorkspaceApps } from "@/shared/types";

export const PAID_APP_IDS: PaidAppId[] = [
  "notes",
  "reviews",
  "alerts",
  "links",
  "bio",
  "popups",
  "funnels",
  "publicDashboard",
  "insights",
  "tasks",
  "invoicing",
];

const PAYMENT_ONLY_APP_IDS: PaidAppId[] = [
  "notes",
  "popups",
  "publicDashboard",
  "insights",
  "tasks",
  "invoicing",
];

export function isPaidApp(id: WorkspaceAppId): id is PaidAppId {
  return (PAID_APP_IDS as WorkspaceAppId[]).includes(id);
}

export function appUnlocked(apps: WorkspaceApps | undefined, id: WorkspaceAppId): boolean {
  if (!isPaidApp(id)) return true;
  const state = apps?.[id];
  if (state?.paidAt) return true;
  return !PAYMENT_ONLY_APP_IDS.includes(id) && Boolean(state?.enabledAt);
}
