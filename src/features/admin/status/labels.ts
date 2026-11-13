import type { IncidentImpact, IncidentStatus, LiveCheck, StatusComponentId } from "./types";

export const COMPONENT_OPTIONS: { value: StatusComponentId; label: string }[] = [
  { value: "dashboard", label: "Dashboard" },
  { value: "api", label: "API" },
  { value: "tracking", label: "Tracking" },
  { value: "forms", label: "Lead capture" },
  { value: "invoicing", label: "Invoicing" },
  { value: "jobs", label: "Scheduled jobs" },
];

export const COMPONENT_LABEL = Object.fromEntries(COMPONENT_OPTIONS.map((o) => [o.value, o.label])) as Record<StatusComponentId, string>;

export const IMPACT_OPTIONS: { value: IncidentImpact; label: string; hint: string }[] = [
  { value: "minor", label: "Degraded", hint: "Slow or partly failing. Parts show as degraded." },
  { value: "major", label: "Outage", hint: "Down for most people. Parts show as an outage." },
  { value: "maintenance", label: "Maintenance", hint: "Planned work. Parts show as under maintenance." },
];

export const IMPACT_LABEL = Object.fromEntries(IMPACT_OPTIONS.map((o) => [o.value, o.label])) as Record<IncidentImpact, string>;

export const INCIDENT_STATUS_OPTIONS: { value: IncidentStatus; label: string }[] = [
  { value: "investigating", label: "Investigating" },
  { value: "identified", label: "Identified" },
  { value: "monitoring", label: "Monitoring" },
  { value: "resolved", label: "Resolved" },
];

export const MAINTENANCE_STATUS_OPTIONS: { value: IncidentStatus; label: string }[] = [
  { value: "scheduled", label: "Scheduled" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

export function statusOptionsFor(impact: IncidentImpact) {
  return impact === "maintenance" ? MAINTENANCE_STATUS_OPTIONS : INCIDENT_STATUS_OPTIONS;
}

export const CHECK_STATE: Record<LiveCheck["state"], { label: string; tone: string }> = {
  operational: { label: "Operational", tone: "good" },
  degraded: { label: "Degraded", tone: "warn" },
  outage: { label: "Down", tone: "bad" },
  unknown: { label: "Not checked", tone: "idle" },
};
