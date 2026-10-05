import type { ReportSchedule } from "@/shared/types";
import { DEMO_SITE_ID, DEMO_SITE_ID_2 } from "@/features/demo/demoData";

const now = Date.now();
const iso = (msAgo: number) => new Date(now - msAgo).toISOString();
const isoIn = (msAhead: number) => new Date(now + msAhead).toISOString();
const DAY = 86_400_000;

export const demoReports: ReportSchedule[] = [
  {
    id: "demo-report-weekly",
    name: "Weekly traffic summary",
    siteIds: [],
    frequency: "weekly",
    recipients: [
      { email: "owner@acme.example", unsubscribed: false },
      { email: "priya@acme.example", unsubscribed: false },
    ],
    phoneRecipients: [],
    channels: { email: true, whatsapp: false },
    include: { analytics: true, seo: false, dashboardLink: true, aiSummary: true },
    attachXlsx: false,
    enabled: true,
    lastSentAt: iso(6 * DAY),
    nextRunAt: isoIn(1 * DAY),
  },
  {
    id: "demo-report-monthly-seo",
    name: "Monthly SEO health check",
    siteIds: [DEMO_SITE_ID],
    frequency: "monthly",
    recipients: [{ email: "owner@acme.example", unsubscribed: false }],
    phoneRecipients: [{ phone: "919876500000", label: "Priya (growth)", optedOut: false }],
    channels: { email: true, whatsapp: true },
    include: { analytics: false, seo: true, dashboardLink: true, aiSummary: false },
    attachXlsx: true,
    enabled: true,
    lastSentAt: iso(18 * DAY),
    nextRunAt: isoIn(12 * DAY),
  },
  {
    id: "demo-report-docs-daily",
    name: "Docs site daily digest",
    siteIds: [DEMO_SITE_ID_2],
    frequency: "daily",
    recipients: [
      { email: "owner@acme.example", unsubscribed: false },
      { email: "marcus@acme.example", unsubscribed: true },
    ],
    phoneRecipients: [],
    channels: { email: true, whatsapp: false },
    include: { analytics: true, seo: false, dashboardLink: false, aiSummary: false },
    attachXlsx: false,
    enabled: false,
    lastSentAt: iso(9 * DAY),
    nextRunAt: isoIn(1 * DAY),
  },
];

export function demoReportSchedulesResponse(): { schedules: ReportSchedule[]; mailConfigured: boolean } {
  return { schedules: demoReports, mailConfigured: true };
}
