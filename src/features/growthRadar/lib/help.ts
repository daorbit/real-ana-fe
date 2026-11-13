import type { DetectorRun, Level, OpportunityStatus, RadarScan, RadarSourceId, SourceState } from "../types";

export const SCAN_HELP =
  "Growth Radar reads your data every morning at 06:00 UTC and compares it with earlier periods. Findings update after each scan.";

export const PRIORITY_HELP: Record<Level, string> = {
  high: "Worth looking at this week. A large change, backed by enough data, that happened recently.",
  medium: "Worth a look soon. Either the change is smaller, or the data behind it is thinner.",
  low: "Good to know. Small, slow or based on limited data. Check it when you have time.",
};

export const PRIORITY_GROUP_HELP =
  "Priority comes from three things: how much is at stake (impact), how much data backs it (confidence) and how recent it is (urgency).";

export const FACTOR_HELP = {
  impact: "How much is at stake: the number of visits, leads or clicks involved, and how far the number moved.",
  confidence: "How much data backs the finding. Small numbers can move by chance, so they get lower confidence.",
  urgency: "How recent and sharp the change is. A drop in the latest week is more urgent than a slow drift over a month.",
  effort: "A rough guess at the work involved. It does not change the priority.",
} as const;

export const STATUS_HELP: Record<OpportunityStatus, string> = {
  open: "Found by Growth Radar and not looked at yet.",
  planned: "Someone has decided to act on it.",
  investigating: "Someone is looking into the cause.",
  resolved: "Marked as handled. If the same pattern shows up again, it reopens on its own.",
  dismissed: "Marked as not useful. It stays out of your list.",
  archived: "Not detected for 14 days, so Growth Radar put it away.",
};

export const SNOOZED_HELP = "Hidden from your list until the date you picked. It comes back if it is still detected.";

export const NOT_DETECTED_HELP = "The latest scan no longer sees this pattern. If it stays away for 14 days, the finding is archived.";

export const SOURCE_HELP: Record<RadarSourceId, string> = {
  analytics: "Sessions and the pages visits start on, from the Quantalog tracking script on your site.",
  leadCapture: "Form views, responses and the page each lead came from, from your Lead capture forms.",
  bookings: "Forms with a booking field, and how many bookings they take.",
  searchConsole: "Google impressions, clicks and click-through rate, from Google Search Console.",
};

export const SOURCE_STATE_HELP: Record<SourceState, string> = {
  ready: "Connected and up to date. Checks that use it can run.",
  not_connected: "Not set up yet. Checks that need it are skipped.",
  stale: "No new data for a few days. Checks that need it are skipped so old data isn't mistaken for a drop.",
  error: "Could not be read in the last scan. It will be tried again on the next one.",
};

export const CHECK_STATUS_HELP: Record<DetectorRun["status"], string> = {
  ran: "This check ran on your latest data.",
  skipped: "This check did not run, usually because a source it needs is missing or there is too little data.",
  failed: "This check hit an error and will run again on the next scan.",
  off: "Turned off in Settings.",
};

export const SCAN_STATUS_HELP: Record<RadarScan["status"], string> = {
  ok: "Every connected source was read and every check ran.",
  partial: "Some sources could not be read, so the checks that need them were skipped.",
  failed: "The scan stopped before it finished. Your findings were not changed.",
};

export const METRIC_HELP: Record<string, string> = {
  sessions: "Visits to your site, counted by the Quantalog tracking script.",
  leads: "Responses to your Lead capture forms in the period.",
  leadRate: "Out of every 100 sessions, how many ended with a lead.",
  pageRate: "Out of every 100 sessions that started on this page, how many brought a lead.",
  siteRate: "The same rate across every page on your site, for comparison.",
  views: "How many times the form loaded. One person can count more than once.",
  responses: "Completed form submissions.",
  completionRate: "Out of every 100 form views, how many were sent.",
  impressions: "How many times your site appeared in Google search results.",
  clicks: "How many times someone clicked through to your site from Google.",
  ctr: "Click-through rate: out of every 100 impressions, how many became a click.",
  position: "Your average place in Google results. Lower is better; 1 is the top.",
  bookings: "Booking form submissions in the period.",
  bookingRate: "Out of every 100 booking form opens, how many became a booking.",
};

export const SECTION_HELP = {
  noticed: "A plain description of the pattern Growth Radar found, using only the numbers below.",
  evidence: "The exact numbers that were compared, and the periods they cover. Nothing here is estimated.",
  why: "Why this pattern is usually worth your time.",
  steps: "Practical things to check, in a sensible order. They are suggestions, not certain fixes.",
  limits: "What this data cannot tell you. Read these before deciding on a cause.",
  owner: "The teammate looking after this finding.",
  outcome: "Record what you changed, and Growth Radar measures the same number again afterwards.",
  notes: "Notes are shared with everyone in the workspace.",
  activity: "Every change to this finding, and when the scans saw it.",
  change: "The difference between the two periods. Percent measures show the change in percentage points.",
  orbit: "Orbit reworded this from the numbers below. Any wording that added a number or a cause would have been thrown away.",
} as const;

export const TALLY_HELP = {
  high: "Open findings rated High priority.",
  planned: "Findings someone has decided to act on.",
  investigating: "Findings someone is looking into.",
  resolved: "Findings marked as handled in the last 30 days.",
} as const;

export const THRESHOLD_HELP =
  "How big a change has to be before this check reports it. Lower finds more, with more false alarms. Higher finds less, but each finding is more certain.";
