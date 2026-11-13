import {
  BarChart3,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  FileText,
  Search,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { DetectorId, EntityType, Level, OpportunityStatus, RadarCategory, RadarSourceId, SourceState } from "../types";

export const CATEGORY_LABEL: Record<RadarCategory, string> = {
  traffic_without_enquiries: "Traffic without enquiries",
  conversion_gap: "Conversion gap",
  form_performance: "Form performance",
  search_visibility: "Search visibility",
  booking_journey: "Booking journey",
};

export const CATEGORY_ICON: Record<RadarCategory, LucideIcon> = {
  traffic_without_enquiries: Users,
  conversion_gap: FileText,
  form_performance: ClipboardList,
  search_visibility: Search,
  booking_journey: CalendarCheck,
};

export const LEVEL_LABEL: Record<Level, string> = { high: "High", medium: "Medium", low: "Low" };

export const FACTOR_LABEL = {
  impact: "Impact",
  confidence: "Confidence",
  urgency: "Urgency",
  effort: "Effort",
} as const;

export const STATUS_LABEL: Record<OpportunityStatus, string> = {
  open: "New",
  planned: "Planned",
  investigating: "Investigating",
  resolved: "Resolved",
  dismissed: "Dismissed",
  archived: "Archived",
};

export const SOURCE_LABEL: Record<RadarSourceId, string> = {
  analytics: "Website analytics",
  leadCapture: "Lead capture",
  bookings: "Bookings",
  searchConsole: "Search Console",
};

export const SOURCE_ICON: Record<RadarSourceId, LucideIcon> = {
  analytics: BarChart3,
  leadCapture: ClipboardList,
  bookings: CalendarDays,
  searchConsole: Search,
};

export const SOURCE_STATE_LABEL: Record<SourceState, string> = {
  ready: "Connected",
  not_connected: "Not connected",
  stale: "No recent data",
  error: "Could not read",
};

export const ENTITY_SOURCE_LABEL: Record<EntityType, string> = {
  workspace: "Open Website analytics",
  page: "Open this page in Website analytics",
  form: "Open Lead insights",
  bookingForm: "Open Bookings",
  searchProperty: "Open Search visibility",
};

export const DETECTOR_META: Record<
  DetectorId,
  { title: string; summary: string; describe: (threshold: number) => string; thresholdLabel: string }
> = {
  trafficWithoutLeads: {
    title: "Traffic without enquiries",
    summary: "Compares the last two complete weeks. Reports when sessions rise but leads don't rise with them.",
    thresholdLabel: "Minimum rise in sessions",
    describe: (t) => `Sessions rose at least ${t}% week on week while leads did not keep up.`,
  },
  pageConversionGap: {
    title: "Pages with weak lead conversion",
    summary: "Looks at the last 28 days. Reports busy landing pages that bring far fewer leads than your site average.",
    thresholdLabel: "Below the site average by",
    describe: (t) => `A busy landing page converts at least ${t}% below your site's average over 28 days.`,
  },
  formRateDecline: {
    title: "Form submission rate drops",
    summary: "Compares the last 30 days with the 30 before. Reports forms that turn fewer views into responses.",
    thresholdLabel: "Minimum drop in rate",
    describe: (t) => `A form's views-to-responses rate fell at least ${t}% against the 30 days before.`,
  },
  searchCtrGap: {
    title: "More impressions, lower click-through",
    summary: "Compares 28 days of Google data with the 28 before. Reports when you show up more but get clicked less.",
    thresholdLabel: "Minimum drop in click-through",
    describe: (t) => `Google impressions rose while click-through fell at least ${t}% over 28 days.`,
  },
  bookingDecline: {
    title: "Booking drops",
    summary: "Compares the last 30 days with the 30 before. Reports booking forms taking fewer bookings while just as many people open them.",
    thresholdLabel: "Minimum drop in bookings",
    describe: (t) => `Bookings fell at least ${t}% while booking form opens held steady.`,
  },
};

export const DISMISS_REASONS = [
  "Not relevant to us",
  "Expected change",
  "Already handled",
  "Data looks wrong",
] as const;
