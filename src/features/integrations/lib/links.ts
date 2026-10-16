import { DOCS_SLUGS, LEGAL_URLS, docsUrl } from "@/shared/lib/docsSlugs";
import { FORMS_API_BASE } from "./formsClient";

const NOTIFICATIONS = docsUrl(DOCS_SLUGS.formsNotificationsAndApps);
const PAYMENTS = `${docsUrl(DOCS_SLUGS.leadCapture)}#connecting`;
const SOCIAL = `${docsUrl(DOCS_SLUGS.scheduledPosts)}#connecting`;

export const GOOGLE_DATA_POLICY_URL = `${LEGAL_URLS.privacy}#google-user-data`;
export const GOOGLE_CALENDAR_DOCS_URL = `${docsUrl(DOCS_SLUGS.formsBooking)}#google-calendar`;
export const GOOGLE_SHEETS_DOCS_URL = docsUrl(DOCS_SLUGS.formsGoogleSheets);

const APP_GUIDES: Record<string, string> = {
  brevo: `${NOTIFICATIONS}#email-app`,
  smtp: `${NOTIFICATIONS}#email-app`,
  slack: `${NOTIFICATIONS}#chat`,
  discord: `${NOTIFICATIONS}#chat`,
  teams: `${NOTIFICATIONS}#chat`,
  telegram: `${NOTIFICATIONS}#telegram`,
  razorpay: PAYMENTS,
  cashfree: PAYMENTS,
  payu: PAYMENTS,
  "google-calendar": GOOGLE_CALENDAR_DOCS_URL,
  "google-sheets": GOOGLE_SHEETS_DOCS_URL,
  webhook: `${docsUrl(DOCS_SLUGS.leadCapture)}#webhook`,
  "search-console": `${docsUrl(DOCS_SLUGS.searchVisibility)}#connecting`,
  linkedin: SOCIAL,
  instagram: SOCIAL,
};

export function appGuideUrl(appId: string): string | undefined {
  return APP_GUIDES[appId];
}

export function paymentWebhookUrl(workspaceId: string, provider: string): string {
  return `${FORMS_API_BASE}/public/workspaces/${encodeURIComponent(workspaceId)}/payments/webhook/${provider}`;
}
