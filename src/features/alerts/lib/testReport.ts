import type { AlertTestReport } from "@/features/alerts/types";

const LABELS: Record<keyof AlertTestReport, string> = {
  inApp: "the bell",
  email: "email",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
};

export function describeTestReport(report: AlertTestReport): { sent: string; reached: number; issues: string[] } {
  const reached: string[] = [];
  const issues: string[] = [];

  (Object.keys(report) as (keyof AlertTestReport)[]).forEach((channel) => {
    const outcome = report[channel];
    if (!outcome) return;
    const label = LABELS[channel];
    if (outcome.skipped && !outcome.sent) issues.push(`${label}: ${outcome.skipped}`);
    else if (outcome.failed) issues.push(`${label}: ${outcome.failed} could not be delivered`);
    if (outcome.sent) reached.push(label);
  });

  return {
    sent: reached.length ? `Test alert sent to ${reached.join(", ")}.` : "The test alert did not reach any channel.",
    reached: reached.length,
    issues,
  };
}
