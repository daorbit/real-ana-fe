import type {
  SeoCompareSnapshot, SeoCompetitorAnalysis, SeoCompetitorComparison,
  SeoCompetitorHistoryPoint, SeoMetricComparison,
} from "@/shared/types";
import { DEMO_SITE_ID, demoCompetitors } from "@/features/demo/demoData";

const now = Date.now();
const iso = (msAgo: number) => new Date(now - msAgo).toISOString();
const DAY = 86_400_000;

const mySnapshot: SeoCompareSnapshot = {
  url: "https://acme.example/",
  finalUrl: "https://acme.example/",
  fetchedAt: iso(3 * 3_600_000),
  statusCode: 200,
  responseTimeMs: 412,
  pageBytes: 254_118,
  title: "Acme — developer tools that get out of the way",
  titleLength: 48,
  description: "Acme ships developer tools teams actually enjoy using.",
  descriptionLength: 55,
  canonical: "https://acme.example/",
  h1Count: 1,
  h2Count: 7,
  wordCount: 1284,
  imageCount: 12,
  imagesMissingAlt: 1,
  internalLinks: 39,
  externalLinks: 9,
  hasHttps: true,
  hasOpenGraph: true,
  hasTwitterCards: true,
  hasStructuredData: true,
  schemaTypes: ["Organization", "WebSite", "SoftwareApplication", "FAQPage"],
  schemaErrors: 0,
  score: 88,
};

const metric = (
  id: string, label: string, mine: string, theirs: string,
  verdict: SeoMetricComparison["verdict"], weight: number, note?: string,
): SeoMetricComparison => ({
  id, label, mine, theirs, verdict, weight,
  impact: verdict === "lose" ? weight * 0.6 : 0,
  ...(note ? { note } : {}),
});

const rivalMetrics: SeoMetricComparison[] = [
  metric("score", "Overall score", "88", "74", "win", 0.3),
  metric(
    "wordCount", "Word count", "1,284", "940", "win", 0.15,
  ),
  metric(
    "responseTime", "Response time", "412 ms", "640 ms", "win", 0.15,
  ),
  metric(
    "schema", "Structured data", "4 types", "none", "win", 0.1,
  ),
  metric(
    "altText", "Images missing alt", "1 of 12", "3 of 8", "win", 0.1,
  ),
  metric(
    "twitterCards", "Twitter cards", "present", "missing", "lose", 0.1,
    "Rival has no Twitter card either, but your og:image is smaller than theirs — a larger share image out-performs on link previews.",
  ),
];

const rivalComparison: SeoCompetitorComparison = {
  competitorId: demoCompetitors[0]._id,
  label: demoCompetitors[0].label,
  url: demoCompetitors[0].url,
  lastCheckedAt: demoCompetitors[0].lastCheckedAt,
  lastError: "",
  lastErrorAt: null,
  readIssue: null,
  snapshot: demoCompetitors[0].snapshot as SeoCompareSnapshot,
  gap: {
    scoreGap: -14,
    metrics: rivalMetrics,
    missingKeywords: ["managed infrastructure", "zero-downtime"],
    missingSchemaTypes: [],
    contentGaps: ["No dedicated pricing comparison page"],
    recommendations: [
      "Ship a bigger og:image — Rival's link previews read better on social.",
      "Add a managed-infrastructure comparison section; it's a term Rival ranks for that you don't mention.",
    ],
  },
};

const nimbusMetrics: SeoMetricComparison[] = [
  metric("score", "Overall score", "88", "81", "win", 0.3),
  metric("wordCount", "Word count", "1,284", "1,050", "win", 0.15),
  metric("responseTime", "Response time", "412 ms", "510 ms", "win", 0.15),
  metric(
    "schema", "Structured data", "4 types", "2 types", "win", 0.1,
    undefined,
  ),
  metric("altText", "Images missing alt", "1 of 12", "0 of 10", "lose", 0.1, "Nimbus has zero images missing alt text — an easy fix for the one chart image you're missing it on."),
  metric("twitterCards", "Twitter cards", "present", "present", "tie", 0.1),
];

const nimbusComparison: SeoCompetitorComparison = {
  competitorId: demoCompetitors[1]._id,
  label: demoCompetitors[1].label,
  url: demoCompetitors[1].url,
  lastCheckedAt: demoCompetitors[1].lastCheckedAt,
  lastError: "",
  lastErrorAt: null,
  readIssue: null,
  snapshot: demoCompetitors[1].snapshot as SeoCompareSnapshot,
  gap: {
    scoreGap: -7,
    metrics: nimbusMetrics,
    missingKeywords: ["zero-ops"],
    missingSchemaTypes: ["SoftwareApplication", "FAQPage"],
    contentGaps: [],
    recommendations: ["Fix the one chart image missing alt text — Nimbus already has none missing."],
  },
};

const fastlaneMetrics: SeoMetricComparison[] = [
  metric("score", "Overall score", "88", "58", "win", 0.3),
  metric("wordCount", "Word count", "1,284", "520", "win", 0.15),
  metric("responseTime", "Response time", "412 ms", "890 ms", "win", 0.15),
  metric("schema", "Structured data", "4 types", "none", "win", 0.1),
  metric("altText", "Images missing alt", "1 of 12", "4 of 5", "win", 0.1),
  metric("twitterCards", "Twitter cards", "present", "missing", "win", 0.1),
];

const fastlaneComparison: SeoCompetitorComparison = {
  competitorId: demoCompetitors[2]._id,
  label: demoCompetitors[2].label,
  url: demoCompetitors[2].url,
  lastCheckedAt: demoCompetitors[2].lastCheckedAt,
  lastError: "",
  lastErrorAt: null,
  readIssue: null,
  snapshot: demoCompetitors[2].snapshot as SeoCompareSnapshot,
  gap: {
    scoreGap: -30,
    metrics: fastlaneMetrics,
    missingKeywords: [],
    missingSchemaTypes: [],
    contentGaps: ["No pricing page found", "Thin homepage copy"],
    recommendations: ["Nothing to chase here — you lead Fastlane on every measured signal."],
  },
};

export const demoCompetitorAnalysis: SeoCompetitorAnalysis = {
  mine: mySnapshot,
  baseline: { source: "live", checkedAt: iso(3 * 3_600_000), lastError: "", readIssue: null },
  auditedAt: iso(3 * 3_600_000),
  competitors: [rivalComparison, nimbusComparison, fastlaneComparison],
  toughest: nimbusComparison.competitorId,
  position: {
    rank: 1,
    fieldSize: 4,
    percentile: 100,
    leader: null,
    gapToLeader: 0,
    nextUp: null,
    closestBehind: { label: nimbusComparison.label, competitorId: nimbusComparison.competitorId, gap: 7 },
  },
};

export const demoCompetitorHistory: SeoCompetitorHistoryPoint[] = [
  { competitorId: rivalComparison.competitorId, score: 69, wordCount: 860, responseTimeMs: 710, statusCode: 200, takenAt: iso(27 * DAY) },
  { competitorId: rivalComparison.competitorId, score: 71, wordCount: 890, responseTimeMs: 680, statusCode: 200, takenAt: iso(14 * DAY) },
  { competitorId: rivalComparison.competitorId, score: 73, wordCount: 920, responseTimeMs: 655, statusCode: 200, takenAt: iso(6 * DAY) },
  { competitorId: rivalComparison.competitorId, score: 74, wordCount: 940, responseTimeMs: 640, statusCode: 200, takenAt: iso(1 * DAY) },

  { competitorId: nimbusComparison.competitorId, score: 76, wordCount: 960, responseTimeMs: 560, statusCode: 200, takenAt: iso(27 * DAY) },
  { competitorId: nimbusComparison.competitorId, score: 78, wordCount: 1_000, responseTimeMs: 540, statusCode: 200, takenAt: iso(14 * DAY) },
  { competitorId: nimbusComparison.competitorId, score: 80, wordCount: 1_030, responseTimeMs: 520, statusCode: 200, takenAt: iso(6 * DAY) },
  { competitorId: nimbusComparison.competitorId, score: 81, wordCount: 1_050, responseTimeMs: 510, statusCode: 200, takenAt: iso(2 * DAY) },

  { competitorId: fastlaneComparison.competitorId, score: 61, wordCount: 480, responseTimeMs: 940, statusCode: 200, takenAt: iso(12 * DAY) },
  { competitorId: fastlaneComparison.competitorId, score: 58, wordCount: 520, responseTimeMs: 890, statusCode: 200, takenAt: iso(4 * DAY) },

  { competitorId: "__you__", score: 82, wordCount: 1_120, responseTimeMs: 470, statusCode: 200, takenAt: iso(27 * DAY) },
  { competitorId: "__you__", score: 85, wordCount: 1_210, responseTimeMs: 440, statusCode: 200, takenAt: iso(14 * DAY) },
  { competitorId: "__you__", score: 88, wordCount: 1_284, responseTimeMs: 412, statusCode: 200, takenAt: iso(1 * DAY) },
];

export const demoCompetitorBriefAvailable = { available: true };

export { demoCompetitors, DEMO_SITE_ID };
