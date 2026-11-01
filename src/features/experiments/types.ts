export type ExperimentType = "split" | "changes" | "code";
export type ExperimentStatus = "draft" | "running" | "paused" | "ended";
export type ChangeAction = "text" | "hide" | "attr" | "style";
export type ExperimentDevices = "all" | "desktop" | "mobile";
export type ExperimentPageMode = "all" | "include" | "exclude";

export interface ExperimentChange {
  selector: string;
  action: ChangeAction;
  attr: string;
  value: string;
}

export interface ExperimentVariant {
  key: string;
  name: string;
  weight: number;
  redirectUrl: string;
  changes: ExperimentChange[];
}

export interface ExperimentInput {
  name: string;
  siteId: string;
  key: string;
  type: ExperimentType;
  pages: { mode: ExperimentPageMode; patterns: string[] };
  devices: ExperimentDevices;
  goal: { type: "page" | "event"; value: string };
  variants: ExperimentVariant[];
}

export interface Experiment extends ExperimentInput {
  id: string;
  status: ExperimentStatus;
  winner: string;
  keepWinner: boolean;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
}

export interface ExperimentsResponse {
  experiments: Experiment[];
  limit: number;
  running: number;
  plan: string;
}

export interface VariantResult {
  key: string;
  name: string;
  sessions: number;
  conversions: number;
  rate: number;
  uplift: number | null;
  confidence: number | null;
}

export interface ExperimentResults {
  variants: VariantResult[];
  totalSessions: number;
  leader: string | null;
  winner: string | null;
  enoughData: boolean;
  since: string | null;
  until: string | null;
}

export interface ExperimentDetail {
  experiment: Experiment;
  results: ExperimentResults;
}
