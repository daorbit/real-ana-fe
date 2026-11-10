import { hostFrameUrl } from "@/shared/lib/hostFrameUrl";

export const INVOICES_APP_BASE: string = import.meta.env.VITE_INVOICES_URL ?? "";

const DEMO_INVOICES_WORKSPACE = "64656d6f64656d6f64656d6f";

export function invoicesAppUrl(workspaceId: string): string {
  return hostFrameUrl(INVOICES_APP_BASE, `/${workspaceId}`);
}

export function invoicesDemoUrl(): string {
  return `${hostFrameUrl(INVOICES_APP_BASE, `/${DEMO_INVOICES_WORKSPACE}`)}&demo=1`;
}
