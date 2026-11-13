import type { RadarAction } from "../types";
import { metricChange, metricValue } from "./format";

export type OutcomeView =
  | { state: "waiting"; endsAt: string }
  | { state: "observed"; before: string; after: string; change: string; dir: "up" | "down" | "flat" };

export function outcomeOf(action: RadarAction): OutcomeView {
  if (!action.latest) return { state: "waiting", endsAt: action.followUpEndsAt };
  const change = metricChange({ current: action.latest.value, previous: action.baseline, unit: action.unit });
  return {
    state: "observed",
    before: metricValue(action.unit, action.baseline),
    after: metricValue(action.unit, action.latest.value),
    change: change?.text ?? "No change",
    dir: change?.dir ?? "flat",
  };
}
