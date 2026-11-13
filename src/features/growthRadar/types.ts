export type RadarSourceId = "analytics" | "leadCapture" | "bookings" | "searchConsole";
export type SourceState = "ready" | "not_connected" | "stale" | "error";

export type SourceStatus = { id: RadarSourceId; state: SourceState; detail: string; freshAt: string | null };

export type DetectorId = "trafficWithoutLeads" | "pageConversionGap" | "formRateDecline" | "searchCtrGap" | "bookingDecline";

export type RadarCategory =
  | "traffic_without_enquiries"
  | "conversion_gap"
  | "form_performance"
  | "search_visibility"
  | "booking_journey";

export type Level = "high" | "medium" | "low";
export type Factor = { level: Level; reason: string };
export type Factors = { impact: Factor; confidence: Factor; urgency: Factor; effort: Factor };

export type OpportunityStatus = "open" | "planned" | "investigating" | "resolved" | "dismissed" | "archived";

export type MetricUnit = "count" | "percent";
export type EvidenceMetric = { key: string; label: string; current: number; previous: number | null; unit: MetricUnit };

export type RadarPeriod = {
  start: string;
  end: string;
  previousStart: string | null;
  previousEnd: string | null;
  days: number;
  includesToday: boolean;
};

export type EntityType = "workspace" | "page" | "form" | "bookingForm" | "searchProperty";
export type RadarEntity = { type: EntityType; key: string; label: string };

export type OpportunityCard = {
  id: string;
  detector: DetectorId;
  category: RadarCategory;
  status: OpportunityStatus;
  priority: Level;
  priorityReason: string;
  factors: Factors;
  entity: RadarEntity;
  title: string;
  summary: string;
  explainedBy: "orbit" | "rules";
  metrics: EvidenceMetric[];
  primaryMetric: string;
  period: RadarPeriod;
  sources: RadarSourceId[];
  detected: boolean;
  firstDetectedAt: string;
  lastDetectedAt: string;
  snoozedUntil: string | null;
  assigneeId: string | null;
  hasAction: boolean;
  closedAt: string | null;
  dismissReason?: string;
};

export type Person = { id: string; name: string; avatarUrl: string };

export type RadarAction = {
  description: string;
  otherChanges: string;
  by: Person | null;
  startedAt: string;
  followUpDays: number;
  followUpEndsAt: string;
  metric: string;
  metricLabel: string;
  unit: MetricUnit;
  baseline: number;
  latest: { value: number; periodStart: string; periodEnd: string } | null;
};

export type OpportunityDetail = OpportunityCard & {
  templateSummary: string;
  detectorVersion: number;
  whyItMatters: string;
  nextSteps: string[];
  limitations: string[];
  sampleSize: number;
  dismissReason: string;
  assignee: Person | null;
  notes: { id: string; text: string; at: string; author: Person | null }[];
  activity: { at: string; kind: string; detail: string; actor: Person | null }[];
  action: RadarAction | null;
};

export type DetectorRun = {
  id: DetectorId;
  version: number;
  status: "ran" | "skipped" | "failed" | "off";
  reason: string;
  found: number;
};

export type RadarScan = {
  id: string;
  trigger: "schedule" | "manual" | "first";
  status: "ok" | "partial" | "failed";
  error: string;
  startedAt: string;
  finishedAt: string;
  sources: SourceStatus[];
  detectors: DetectorRun[];
  found: number;
  created: number;
  reopened: number;
};

export type RadarCounts = {
  active: number;
  high: number;
  planned: number;
  investigating: number;
  snoozed: number;
  resolved: number;
};

export type RadarOverview = {
  lastScan: RadarScan | null;
  opportunities: OpportunityCard[];
  counts: RadarCounts;
  nextScanAt: string | null;
  canRescan: boolean;
  historyDays: number;
};

export type RadarListView = "history" | "snoozed";

export type RadarList = { items: OpportunityCard[]; nextBefore: string | null };

export type DetectorSetting = { enabled: boolean; threshold: number };

export type RadarConfig = {
  detectors: Record<DetectorId, DetectorSetting>;
  notifyHighPriority: boolean;
  aiExplanations: boolean;
};

export type DetectorInfo = {
  id: DetectorId;
  version: number;
  category: RadarCategory;
  requires: RadarSourceId[];
  threshold: { default: number; min: number; max: number; step: number };
};

export type RadarSettings = { config: RadarConfig; detectors: DetectorInfo[] };

export type OpportunityPatch = Partial<{
  status: OpportunityStatus;
  dismissReason: string;
  snoozedUntil: string | null;
  assigneeId: string | null;
}>;

export type ActionDraft = { description: string; otherChanges: string; startedAt?: string };
