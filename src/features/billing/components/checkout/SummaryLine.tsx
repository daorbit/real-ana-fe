import type { ReactNode } from "react";
import classes from "./Checkout.module.css";

export function SummaryLine({
  label,
  value,
  tone,
}: {
  label: ReactNode;
  value: string;
  tone?: "discount";
}) {
  return (
    <div className={classes.line} data-tone={tone}>
      <span className={classes.lineLabel}>{label}</span>
      <span className={classes.lineValue}>{value}</span>
    </div>
  );
}
