import { CheckCircle2, CircleSlash, XCircle, type LucideIcon } from "lucide-react";
import type { SearchInspection } from "@/shared/types";

export type InspectionVerdict = {
  tone: "good" | "warn" | "bad";
  icon: LucideIcon;
  title: string;
  short: string;
};

export function verdictOf(data: SearchInspection): InspectionVerdict {
  const coverage = (data.coverageState ?? "").toLowerCase();
  if (data.verdict === "PASS" || (coverage.includes("indexed") && !coverage.includes("not indexed"))) {
    return { tone: "good", icon: CheckCircle2, title: "Page is on Google", short: "On Google" };
  }
  if (/blocked|noindex|robots/.test(coverage)) {
    return { tone: "warn", icon: CircleSlash, title: "Page is blocked from Google", short: "Blocked" };
  }
  return { tone: "bad", icon: XCircle, title: "Page is not on Google", short: "Not on Google" };
}
