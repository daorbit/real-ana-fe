import { Fragment, type ReactNode } from "react";
import { Text } from "@mantine/core";
import { ChevronRight, CircleCheck, FlaskConical, TriangleAlert } from "lucide-react";
import classes from "./Payments.module.css";

export function Crumbs({ steps }: { steps: string[] }) {
  return (
    <span className={classes.crumbs}>
      {steps.map((step, index) => (
        <Fragment key={step}>
          {index > 0 && <ChevronRight size={11} className={classes.crumbSep} />}
          {step}
        </Fragment>
      ))}
    </span>
  );
}

type Tone = "danger" | "warn" | "ok" | "neutral";

const ICONS: Record<Tone, typeof TriangleAlert> = {
  danger: TriangleAlert,
  warn: TriangleAlert,
  ok: CircleCheck,
  neutral: FlaskConical,
};

export function Callout({ tone, title, children }: { tone: Tone; title?: string; children: ReactNode }) {
  const Icon = ICONS[tone];
  return (
    <div className={classes.callout} data-tone={tone}>
      <Icon size={16} className={classes.calloutIcon} />
      <div>
        {title && (
          <Text size="sm" fw={600} mb={2}>
            {title}
          </Text>
        )}
        <Text size="xs" c="dimmed" component="div">
          {children}
        </Text>
      </div>
    </div>
  );
}
