import type { ReportSchedule, ReportFrequency } from "../../types";

/**
 * The dialog's working copy of a schedule.
 *
 * Flat rather than mirroring the API's nested `channels`/`include` objects: the
 * form binds one control per field, and a nested draft turns every checkbox
 * into a spread of a spread. It's converted back on save, in one place.
 */
export type Draft = {
  name: string;
  frequency: ReportFrequency;
  siteIds: string[];
  recipients: string[];
  emailChannel: boolean;
  whatsappChannel: boolean;
  analytics: boolean;
  seo: boolean;
  dashboardLink: boolean;
  attachXlsx: boolean;
  enabled: boolean;
};

export const emptyDraft = (): Draft => ({
  name: "",
  frequency: "weekly",
  siteIds: [],
  recipients: [],
  emailChannel: true,
  whatsappChannel: false,
  analytics: true,
  seo: true,
  dashboardLink: false,
  attachXlsx: true,
  enabled: true,
});

export const fromSchedule = (s: ReportSchedule): Draft => ({
  name: s.name,
  frequency: s.frequency,
  siteIds: s.siteIds,
  // The owner's address is added server-side on every save, so it isn't shown
  // as a removable chip — removing it would be a no-op and look like a bug.
  recipients: s.recipients.slice(1).map((r) => r.email),
  emailChannel: s.channels.email,
  whatsappChannel: s.channels.whatsapp,
  analytics: s.include.analytics,
  seo: s.include.seo,
  dashboardLink: s.include.dashboardLink,
  attachXlsx: s.attachXlsx,
  enabled: s.enabled,
});
