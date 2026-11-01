import type { ChangeAction, ExperimentStatus, ExperimentType } from "@/features/experiments/types";

export const TYPE_OPTIONS: { value: ExperimentType; label: string; hint: string }[] = [
  { value: "changes", label: "Page changes", hint: "Change text, hide parts, or swap a link or image on the same page." },
  { value: "split", label: "Split URL", hint: "Send part of the visitors to a different page and compare." },
  { value: "code", label: "Code", hint: "Your developer reads the variant with rta.variant() and builds the change." },
];

export const TYPE_LABEL: Record<ExperimentType, string> = {
  changes: "Page changes",
  split: "Split URL",
  code: "Code",
};

export const STATUS_LABEL: Record<ExperimentStatus, string> = {
  draft: "Draft",
  running: "Running",
  paused: "Paused",
  ended: "Ended",
};

export const STATUS_COLOR: Record<ExperimentStatus, string> = {
  draft: "gray",
  running: "teal",
  paused: "orange",
  ended: "gray",
};

export const CHANGE_ACTION_OPTIONS: { value: ChangeAction; label: string }[] = [
  { value: "text", label: "Replace text" },
  { value: "hide", label: "Hide it" },
  { value: "attr", label: "Change link or image" },
  { value: "style", label: "Add style" },
];

export const ATTR_OPTIONS = [
  { value: "href", label: "Link address (href)" },
  { value: "src", label: "Image address (src)" },
  { value: "alt", label: "Image text (alt)" },
  { value: "placeholder", label: "Placeholder" },
];

export const GOAL_TYPE_OPTIONS = [
  { value: "page", label: "Visits a page" },
  { value: "event", label: "Triggers an event" },
];

export function percent(value: number | null, digits = 1): string {
  if (value === null || !Number.isFinite(value)) return "–";
  return `${(value * 100).toFixed(digits)}%`;
}

export function signedPercent(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "–";
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(1)}%`;
}
