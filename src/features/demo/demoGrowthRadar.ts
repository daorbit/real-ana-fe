import type {
  OpportunityCard,
  OpportunityDetail,
  RadarList,
  RadarOverview,
  RadarScan,
  RadarSettings,
  SourceStatus,
} from "@/features/growthRadar/types";

const now = Date.now();
const DAY = 86_400_000;
const iso = (msAgo: number) => new Date(now - msAgo).toISOString();
const dayStart = (daysAgo: number) => {
  const d = new Date(now - daysAgo * DAY);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
};

const sources: SourceStatus[] = [
  { id: "analytics", state: "ready", detail: "acme.co", freshAt: iso(4 * 60_000) },
  { id: "leadCapture", state: "ready", detail: "4 forms", freshAt: iso(2 * 60 * 60_000) },
  { id: "bookings", state: "ready", detail: "1 booking form", freshAt: iso(2 * 60 * 60_000) },
  { id: "searchConsole", state: "ready", detail: "acme.co", freshAt: dayStart(3) },
];

const week = { start: dayStart(7), end: dayStart(0), previousStart: dayStart(14), previousEnd: dayStart(7), days: 7, includesToday: false };
const month = { start: dayStart(28), end: dayStart(0), previousStart: null, previousEnd: null, days: 28, includesToday: false };
const forms30 = { start: dayStart(29), end: iso(0), previousStart: dayStart(59), previousEnd: dayStart(29), days: 30, includesToday: true };
const search28 = { start: dayStart(31), end: dayStart(3), previousStart: dayStart(59), previousEnd: dayStart(31), days: 28, includesToday: false };

const cards: OpportunityCard[] = [
  {
    id: "demo-traffic",
    detector: "trafficWithoutLeads",
    category: "traffic_without_enquiries",
    status: "open",
    priority: "high",
    priorityReason: "High priority: At the earlier rate about 74 leads would be expected last week, and 41 came in. Both weeks have plenty of sessions and leads. Seen in the most recent complete week.",
    factors: {
      impact: { level: "high", reason: "At the earlier rate about 74 leads would be expected last week, and 41 came in." },
      confidence: { level: "high", reason: "Both weeks have plenty of sessions and leads." },
      urgency: { level: "medium", reason: "Seen in the most recent complete week." },
      effort: { level: "medium", reason: "Usually means checking traffic sources, landing pages and where forms sit." },
    },
    entity: { type: "workspace", key: "", label: "Acme" },
    title: "Sessions up 38%, but leads down 7%",
    summary: "5,320 sessions last week against 3,850 the week before, while leads went from 44 to 41. Sessions that became a lead fell from 1.1% to 0.8%.",
    explainedBy: "rules",
    metrics: [
      { key: "sessions", label: "Sessions", current: 5320, previous: 3850, unit: "count" },
      { key: "leads", label: "Leads", current: 41, previous: 44, unit: "count" },
      { key: "leadRate", label: "Sessions that became a lead", current: 0.8, previous: 1.1, unit: "percent" },
    ],
    primaryMetric: "leadRate",
    period: week,
    sources: ["analytics", "leadCapture"],
    detected: true,
    firstDetectedAt: iso(2 * DAY),
    lastDetectedAt: iso(3 * 60 * 60_000),
    snoozedUntil: null,
    assigneeId: null,
    hasAction: false,
    closedAt: null,
  },
  {
    id: "demo-page",
    detector: "pageConversionGap",
    category: "conversion_gap",
    status: "planned",
    priority: "medium",
    priorityReason: "Medium priority: This page started 22% of all sessions. At the site's average rate it would bring about 31 leads, and it brought 9. Enough sessions to compare, though lead counts are modest. A pattern over four weeks rather than a sudden change.",
    factors: {
      impact: { level: "high", reason: "This page started 22% of all sessions. At the site's average rate it would bring about 31 leads, and it brought 9." },
      confidence: { level: "medium", reason: "Enough sessions to compare, though lead counts are modest." },
      urgency: { level: "low", reason: "A pattern over four weeks rather than a sudden change." },
      effort: { level: "medium", reason: "Usually a page change: the call to action, form placement or content." },
    },
    entity: { type: "page", key: "/pricing", label: "/pricing" },
    title: "/pricing gets visits but few leads",
    summary: "4,100 sessions started on /pricing in the last 28 days and 9 leads came from it: 0.2% against 0.8% across your site.",
    explainedBy: "orbit",
    metrics: [
      { key: "sessions", label: "Sessions started here", current: 4100, previous: null, unit: "count" },
      { key: "leads", label: "Leads from this page", current: 9, previous: null, unit: "count" },
      { key: "pageRate", label: "Sessions that became a lead", current: 0.2, previous: null, unit: "percent" },
      { key: "siteRate", label: "Site average", current: 0.8, previous: null, unit: "percent" },
    ],
    primaryMetric: "pageRate",
    period: month,
    sources: ["analytics", "leadCapture"],
    detected: true,
    firstDetectedAt: iso(9 * DAY),
    lastDetectedAt: iso(3 * 60 * 60_000),
    snoozedUntil: null,
    assigneeId: "demo-user-priya",
    hasAction: true,
    closedAt: null,
  },
  {
    id: "demo-form",
    detector: "formRateDecline",
    category: "form_performance",
    status: "investigating",
    priority: "medium",
    priorityReason: "Medium priority: At its earlier rate this form would have about 58 responses from these views, and it has 36. Enough views to compare, though the counts are modest. A steady drop over the last 30 days.",
    factors: {
      impact: { level: "high", reason: "At its earlier rate this form would have about 58 responses from these views, and it has 36." },
      confidence: { level: "medium", reason: "Enough views to compare, though the counts are modest." },
      urgency: { level: "medium", reason: "A steady drop over the last 30 days." },
      effort: { level: "low", reason: "Usually a form fix: a field, a step or a validation rule." },
    },
    entity: { type: "form", key: "demo-form-contact", label: "Contact us" },
    title: "“Contact us” turns fewer views into responses",
    summary: "4.5% of views became a response in the last 30 days, down from 7.2% in the 30 days before (36 responses from 800 views).",
    explainedBy: "rules",
    metrics: [
      { key: "views", label: "Views", current: 800, previous: 750, unit: "count" },
      { key: "responses", label: "Responses", current: 36, previous: 54, unit: "count" },
      { key: "completionRate", label: "Views that became a response", current: 4.5, previous: 7.2, unit: "percent" },
    ],
    primaryMetric: "completionRate",
    period: forms30,
    sources: ["leadCapture"],
    detected: true,
    firstDetectedAt: iso(5 * DAY),
    lastDetectedAt: iso(3 * 60 * 60_000),
    snoozedUntil: null,
    assigneeId: null,
    hasAction: false,
    closedAt: null,
  },
  {
    id: "demo-search",
    detector: "searchCtrGap",
    category: "search_visibility",
    status: "open",
    priority: "low",
    priorityReason: "Low priority: At the earlier click-through rate these impressions would bring about 1,180 clicks, and they brought 1,020. Enough impressions to compare. Built up over four weeks rather than overnight.",
    factors: {
      impact: { level: "high", reason: "At the earlier click-through rate these impressions would bring about 1,180 clicks, and they brought 1,020." },
      confidence: { level: "medium", reason: "Enough impressions to compare." },
      urgency: { level: "low", reason: "Built up over four weeks rather than overnight." },
      effort: { level: "low", reason: "Usually titles and descriptions on the pages that gained impressions." },
    },
    entity: { type: "searchProperty", key: "demo-site", label: "acme.co" },
    title: "More Google impressions, but fewer clicks per search",
    summary: "Impressions rose 31% to 42,500 over 28 days, while click-through fell from 2.8% to 2.4%.",
    explainedBy: "rules",
    metrics: [
      { key: "impressions", label: "Impressions", current: 42500, previous: 32400, unit: "count" },
      { key: "clicks", label: "Clicks", current: 1020, previous: 907, unit: "count" },
      { key: "ctr", label: "Click-through rate", current: 2.4, previous: 2.8, unit: "percent" },
      { key: "position", label: "Average position", current: 14.2, previous: 12.9, unit: "count" },
    ],
    primaryMetric: "ctr",
    period: search28,
    sources: ["searchConsole"],
    detected: true,
    firstDetectedAt: iso(12 * DAY),
    lastDetectedAt: iso(3 * 60 * 60_000),
    snoozedUntil: null,
    assigneeId: null,
    hasAction: false,
    closedAt: null,
  },
];

const scan: RadarScan = {
  id: "demo-scan-1",
  trigger: "schedule",
  status: "ok",
  error: "",
  startedAt: iso(3 * 60 * 60_000),
  finishedAt: iso(3 * 60 * 60_000 - 9_000),
  sources,
  detectors: [
    { id: "trafficWithoutLeads", version: 1, status: "ran", reason: "", found: 1 },
    { id: "pageConversionGap", version: 1, status: "ran", reason: "", found: 1 },
    { id: "formRateDecline", version: 1, status: "ran", reason: "", found: 1 },
    { id: "searchCtrGap", version: 1, status: "ran", reason: "", found: 1 },
    { id: "bookingDecline", version: 1, status: "ran", reason: "", found: 0 },
  ],
  found: 4,
  created: 1,
  reopened: 0,
};

const nextMorning = (() => {
  const d = new Date(now);
  d.setUTCHours(6, 0, 0, 0);
  if (d.getTime() <= now) d.setTime(d.getTime() + DAY);
  return d.toISOString();
})();

export const demoRadarOverview: RadarOverview = {
  lastScan: scan,
  opportunities: cards,
  counts: { active: 4, high: 1, planned: 1, investigating: 1, snoozed: 0, resolved: 2 },
  nextScanAt: nextMorning,
  canRescan: true,
  historyDays: 180,
};

const history: OpportunityCard[] = [
  {
    ...cards[2],
    id: "demo-resolved",
    entity: { type: "form", key: "demo-form-quote", label: "Get a quote" },
    title: "“Get a quote” turns fewer views into responses",
    status: "resolved",
    closedAt: iso(6 * DAY),
    detected: false,
  },
  {
    ...cards[3],
    id: "demo-dismissed",
    status: "dismissed",
    dismissReason: "Expected change",
    closedAt: iso(20 * DAY),
    detected: false,
  },
];

export const demoRadarHistory: RadarList = { items: history, nextBefore: null };
export const demoRadarSnoozed: RadarList = { items: [], nextBefore: null };
export const demoRadarScans = { scans: [scan, { ...scan, id: "demo-scan-0", startedAt: iso(27 * 60 * 60_000), finishedAt: iso(27 * 60 * 60_000 - 8_000), created: 0 }] };

const STEPS: Record<string, { why: string; steps: string[]; limits: string[] }> = {
  trafficWithoutLeads: {
    why: "More people are reaching your site, but the extra visits are not turning into enquiries. Finding out where the new visits come from and where they land shows whether this is a different audience or a page that is not asking for the enquiry.",
    steps: [
      "Open Website analytics for last week and compare traffic sources with the week before. Note which source grew the most.",
      "Check the pages new visitors land on, and whether each one shows a form or a clear call to action.",
      "Open Lead insights and check that every form still loads and accepts responses.",
      "If one new source drove the rise, decide whether that audience is a fit before changing your pages.",
    ],
    limits: [
      "Leads are counted across every Lead capture form in the workspace, including forms shared outside your website.",
      "Enquiries by phone, email or chat are not counted.",
      "This compares two single weeks. A holiday or a one-off campaign can cause it.",
    ],
  },
  pageConversionGap: {
    why: "This page already gets attention. Bringing it up to your site's usual lead rate would add enquiries without needing more traffic.",
    steps: [
      "Open the page and check that a form or a clear call to action is visible without scrolling, on a phone as well as a computer.",
      "Compare its traffic sources with your best-converting pages in Website analytics.",
      "Check that the page matches what people searched for or clicked on to get there.",
      "If the page has no form, add one or link clearly to your contact page.",
    ],
    limits: [
      "Leads are matched to the page where the visitor first landed, as recorded by the form. 6 of 124 leads had no landing page and are left out.",
      "Some pages, such as blog posts, are not meant to bring enquiries directly.",
    ],
  },
  formRateDecline: {
    why: "People still open the form, but more of them leave without sending it. That usually points to something in the form itself rather than your traffic.",
    steps: [
      "Open the form and fill it in yourself on a phone and a computer, all the way to the thank-you page.",
      "Check recent edits: new required fields, extra steps or a changed submit button.",
      "If partial responses are on, open Lead insights to see the question where people stop.",
    ],
    limits: ["The latest period includes today so far.", "A view is counted each time the form loads, not once per person."],
  },
  searchCtrGap: {
    why: "You are showing up in more searches, but a smaller share of searchers click. Some of that is normal when you start appearing for broader searches.",
    steps: [
      "Open Search visibility and sort pages by impressions to see which ones gained the most.",
      "Check the title and description Google shows for those pages.",
      "Look at average position. If it dropped, the issue is ranking rather than the snippet.",
    ],
    limits: ["Google reports search data with a delay of two to three days.", "This looks at the whole property, not single pages."],
  },
  bookingDecline: { why: "", steps: [], limits: [] },
};

const demoPerson = { id: "demo-user-priya", name: "Priya Shah", avatarUrl: "" };

export function demoRadarDetail(id: string): OpportunityDetail | null {
  const card = [...cards, ...history].find((c) => c.id === id);
  if (!card) return null;
  const copy = STEPS[card.detector];
  const planned = card.id === "demo-page";
  return {
    ...card,
    templateSummary: card.summary,
    detectorVersion: 1,
    whyItMatters: copy.why,
    nextSteps: copy.steps,
    limitations: copy.limits,
    sampleSize: card.metrics[0]?.current ?? 0,
    dismissReason: card.dismissReason ?? "",
    assignee: card.assigneeId ? demoPerson : null,
    notes: planned
      ? [{ id: "demo-note-1", text: "The form sits below the pricing table. Moving a short form above the fold next sprint.", at: iso(4 * DAY), author: demoPerson }]
      : [],
    activity: [
      ...(planned ? [{ at: iso(4 * DAY), kind: "action", detail: "Moved the enquiry form above the pricing table", actor: demoPerson }] : []),
      { at: card.firstDetectedAt, kind: "detected", detail: "", actor: null },
    ],
    action: planned
      ? {
          description: "Moved the enquiry form above the pricing table",
          otherChanges: "",
          by: demoPerson,
          startedAt: iso(4 * DAY),
          followUpDays: 28,
          followUpEndsAt: new Date(now + 25 * DAY).toISOString(),
          metric: "pageRate",
          metricLabel: "Sessions that became a lead",
          unit: "percent",
          baseline: 0.2,
          latest: null,
        }
      : null,
  };
}

export const demoRadarSettings: RadarSettings = {
  config: {
    detectors: {
      trafficWithoutLeads: { enabled: true, threshold: 20 },
      pageConversionGap: { enabled: true, threshold: 50 },
      formRateDecline: { enabled: true, threshold: 30 },
      searchCtrGap: { enabled: true, threshold: 15 },
      bookingDecline: { enabled: true, threshold: 30 },
    },
    notifyHighPriority: true,
    aiExplanations: true,
  },
  detectors: [
    { id: "trafficWithoutLeads", version: 1, category: "traffic_without_enquiries", requires: ["analytics", "leadCapture"], threshold: { default: 20, min: 10, max: 100, step: 5 } },
    { id: "pageConversionGap", version: 1, category: "conversion_gap", requires: ["analytics", "leadCapture"], threshold: { default: 50, min: 20, max: 90, step: 5 } },
    { id: "formRateDecline", version: 1, category: "form_performance", requires: ["leadCapture"], threshold: { default: 30, min: 10, max: 80, step: 5 } },
    { id: "searchCtrGap", version: 1, category: "search_visibility", requires: ["searchConsole"], threshold: { default: 15, min: 5, max: 60, step: 5 } },
    { id: "bookingDecline", version: 1, category: "booking_journey", requires: ["leadCapture", "bookings"], threshold: { default: 30, min: 10, max: 80, step: 5 } },
  ],
};
