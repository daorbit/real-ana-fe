import { FORMS_API_BASE } from "./formsClient";

export const GOOGLE_DATA_POLICY_URL = "https://quantalog.daorbit.in/privacy#google-user-data";
export const GOOGLE_CALENDAR_DOCS_URL = "https://quantalog.daorbit.in/docs/forms-booking#google-access";

export function paymentWebhookUrl(workspaceId: string, provider: string): string {
  return `${FORMS_API_BASE}/public/workspaces/${encodeURIComponent(workspaceId)}/payments/webhook/${provider}`;
}
