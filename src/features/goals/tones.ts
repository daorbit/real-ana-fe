import type { TargetStatus } from "@/features/goals/types";

export type Tone = readonly [string, string];

export const STATUS_TONES: Record<TargetStatus, Tone> = {
  achieved: ["#6ee7b7", "#10b981"],
  onTrack: ["#67e8f9", "#0ea5e9"],
  behind: ["#fcd34d", "#f97316"],
  climbing: ["#93c5fd", "#3b82f6"],
  unavailable: ["#737373", "#525252"],
};

export const RING_PALETTE: Tone[] = [
  ["#6ee7b7", "#10b981"],
  ["#67e8f9", "#0ea5e9"],
  ["#fcd34d", "#f97316"],
];
