import type { FunnelStepInput } from "@/shared/types";

export type Draft = FunnelStepInput;

export const MIN_STEPS = 2;
export const MAX_STEPS = 8;

export function emptySteps(): Draft[] {
  return [
    { type: "page", value: "" },
    { type: "page", value: "" },
  ];
}

export function filledSteps(steps: Draft[]): Draft[] {
  return steps.filter((s) => s.value);
}

export function isRunnable(steps: Draft[]): boolean {
  return filledSteps(steps).length >= MIN_STEPS;
}

export function encodeStep(step: Draft): string | null {
  return step.value ? `${step.type}:${step.value}` : null;
}

export function decodeStep(encoded: string | null): Draft {
  if (!encoded) return { type: "page", value: "" };
  const split = encoded.indexOf(":");
  const type = encoded.slice(0, split) === "event" ? "event" : "page";
  return { type, value: encoded.slice(split + 1) };
}

export function stepsKey(steps: Draft[]): string {
  return filledSteps(steps)
    .map((s) => `${s.type}:${s.value}`)
    .join("|");
}

export function suggestedName(steps: Draft[]): string {
  const filled = filledSteps(steps);
  if (filled.length < MIN_STEPS) return "Untitled funnel";
  return `${filled[0].value} → ${filled[filled.length - 1].value}`.slice(0, 80);
}
