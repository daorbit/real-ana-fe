import type { ReactNode } from "react";
import { AlertTriangle, Check, Info, X, XCircle } from "lucide-react";
import type { SeoIssue } from "@/shared/types";
import { severityTone, type Tone } from "./tone";
import classes from "./seoUi.module.css";

export function Pill({
  tone = "neutral",
  mono = false,
  children,
}: {
  tone?: Tone;
  mono?: boolean;
  children: ReactNode;
}) {
  return (
    <span className={classes.pill} data-tone={tone} data-mono={mono || undefined}>
      {children}
    </span>
  );
}

export function StatusMark({ ok, tone }: { ok: boolean; tone?: Tone }) {
  const Icon = ok ? Check : X;
  return (
    <span className={classes.mark} data-tone={tone ?? (ok ? "good" : "warn")} aria-hidden>
      <Icon size={11} strokeWidth={3} />
    </span>
  );
}

const SEVERITY_ICON = { critical: XCircle, warning: AlertTriangle, info: Info } as const;

export function SeverityIcon({ severity }: { severity: SeoIssue["severity"] }) {
  const Icon = SEVERITY_ICON[severity];
  return (
    <span className={classes.sevIcon} data-tone={severityTone(severity)} aria-hidden>
      <Icon size={14} />
    </span>
  );
}
