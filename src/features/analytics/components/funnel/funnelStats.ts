import type { FunnelResultStep } from "@/shared/types";

export type FunnelSummaryStats = {
  entered: number;
  completed: number;
  conversion: number;
  worst: { index: number; label: string; drop: number; lost: number } | null;
};

export function stepLost(steps: FunnelResultStep[], index: number): number {
  if (index === 0) return 0;
  return Math.max(0, steps[index - 1].count - steps[index].count);
}

export function funnelSummary(steps: FunnelResultStep[]): FunnelSummaryStats {
  const last = steps[steps.length - 1];
  let worst: FunnelSummaryStats["worst"] = null;

  steps.forEach((step, index) => {
    if (index === 0 || step.dropFromPrev <= 0) return;
    if (worst && step.dropFromPrev <= worst.drop) return;
    worst = { index, label: step.label, drop: step.dropFromPrev, lost: stepLost(steps, index) };
  });

  return {
    entered: steps[0]?.count ?? 0,
    completed: last?.count ?? 0,
    conversion: last?.rate ?? 0,
    worst,
  };
}

export function stepCountLabel(count: number): string {
  return `${count} step${count === 1 ? "" : "s"}`;
}
