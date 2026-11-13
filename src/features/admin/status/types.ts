export type StatusComponentId = "dashboard" | "api" | "tracking" | "forms" | "invoicing" | "jobs";

export type IncidentImpact = "minor" | "major" | "maintenance";

export type IncidentStatus = "investigating" | "identified" | "monitoring" | "resolved" | "scheduled" | "in_progress" | "completed";

export type IncidentUpdate = { id: string; status: IncidentStatus; statusLabel: string; body: string; at: string };

export type StatusIncident = {
  id: string;
  title: string;
  impact: IncidentImpact;
  components: StatusComponentId[];
  status: IncidentStatus;
  statusLabel: string;
  startedAt: string;
  resolvedAt: string | null;
  updates: IncidentUpdate[];
};

export type LiveCheck = {
  id: StatusComponentId;
  name: string;
  state: "operational" | "degraded" | "outage" | "unknown";
  latencyMs: number | null;
  message: string;
  lastCheckedAt: string | null;
  lastOkAt: string | null;
};

export type AdminStatusOverview = {
  components: LiveCheck[];
  open: StatusIncident[];
  closed: StatusIncident[];
  subscribers: { confirmed: number; pending: number };
  pendingEmails: number;
};

export type IncidentDraft = {
  title: string;
  impact: IncidentImpact;
  components: StatusComponentId[];
  status: IncidentStatus;
  body: string;
  notify: boolean;
};

export type UpdateDraft = { status: IncidentStatus; body: string; notify: boolean };

export type IncidentEdit = Partial<Pick<StatusIncident, "title" | "impact" | "components">>;
