import { hostFrameUrl } from "@/shared/lib/hostFrameUrl";

export const INVOICES_APP_BASE: string = import.meta.env.VITE_INVOICES_URL ?? "";

export function invoicesAppUrl(workspaceId: string, workspaceToken?: string): string {
  return hostFrameUrl(INVOICES_APP_BASE, `/${workspaceId}`, workspaceToken);
}
