import type { Experiment, ExperimentResults } from "@/features/experiments/types";
import { percent } from "./experimentLabels";

export const MIN_SESSIONS_FOR_WINNER = 100;

export function verdictText(experiment: Experiment, results: ExperimentResults): string {
  if (experiment.status === "draft") return "Start the test to begin splitting visitors.";
  if (!results.totalSessions) return "No visitors have seen the test yet. Check that the tracking tag has data-experiments=\"on\".";
  if (!results.enoughData) return `Still collecting. Each group needs at least ${MIN_SESSIONS_FOR_WINNER} visitors before a winner is called.`;
  const winner = results.variants.find((v) => v.key === results.winner);
  if (!winner) return "No clear winner yet. The groups are converting at similar rates.";
  if (winner.key === results.variants[0]?.key) return `${winner.name} is converting better than every variant. Keep the original.`;
  return `${winner.name} is winning, with a ${percent(winner.confidence, 0)} chance of beating the original.`;
}
