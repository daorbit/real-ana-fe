export type TargetMetric =
  | "visitors"
  | "pageviews"
  | "sessions"
  | "conversions"
  | "formSubmissions"
  | "searchPosition";

export type TargetPeriod = "month" | "quarter";

export type TargetInput = {
  name: string;
  metric: TargetMetric;
  target: number;
  period: TargetPeriod;
  siteId?: string;
  goalId?: string | null;
};

export type TargetProgress = {
  id: string;
  name: string;
  metric: TargetMetric;
  target: number;
  period: TargetPeriod;
  siteId: string;
  goalId: string | null;
  direction: "above" | "below";
  periodKey: string;
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  elapsed: number;
  daysLeft: number;
  status: "ok" | "unavailable";
  reason: string | null;
  current: number | null;
  windowLabel?: string;
  progress: number;
  achieved: boolean;
  projected: number | null;
};

export type TargetStatus = "achieved" | "onTrack" | "behind" | "climbing" | "unavailable";
