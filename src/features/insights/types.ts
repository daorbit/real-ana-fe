export type InsightTone = "good" | "bad" | "info";

export type InsightKind = "traffic" | "engagement" | "source" | "page" | "country" | "device" | "campaign";

export type Insight = {
  id: string;
  kind: InsightKind;
  tone: InsightTone;
  title: string;
  body: string;
  dimension: string;
  key: string;
  current: number;
  previous: number;
  delta: number | null;
  unit: string;
  score: number;
};

export type InsightDigest = {
  id: string;
  weekStart: string;
  periodStart: string;
  periodEnd: string;
  summary: string;
  visitors: number;
  previousVisitors: number;
  insights: Insight[];
  generatedAt: string;
};

export type InsightWeek = { id: string; weekStart: string; count: number };

export type InsightsOverview = {
  digest: InsightDigest | null;
  history: InsightWeek[];
  canRefresh: boolean;
};
