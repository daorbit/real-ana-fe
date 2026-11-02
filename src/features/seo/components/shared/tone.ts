import type { SeoIssue } from "@/shared/types";

export type Tone = "good" | "warn" | "bad" | "info" | "neutral";

export function scoreTone(score: number | null): Tone {
  if (score === null) return "neutral";
  if (score >= 90) return "good";
  if (score >= 50) return "warn";
  return "bad";
}

export function severityTone(severity: SeoIssue["severity"]): Tone {
  if (severity === "critical") return "bad";
  if (severity === "warning") return "warn";
  return "info";
}

export function lengthTone(length: number, min: number, max: number): Tone {
  if (!length) return "bad";
  return length >= min && length <= max ? "good" : "warn";
}
