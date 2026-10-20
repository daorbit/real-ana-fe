import type { ReactNode } from "react";
import { Text } from "@mantine/core";
import { CircleCheck, CircleDashed, LockKeyhole } from "lucide-react";
import classes from "./StudioParts.module.css";

export type StudioState = "live" | "saved" | "off";

export interface StudioStat {
  label: string;
  value: ReactNode;
  tone?: "ok" | "warn";
}

const PILL_TEXT: Record<StudioState, string> = {
  live: "Live",
  saved: "Needs attention",
  off: "Not connected",
};

export function StudioHero({
  state,
  pill,
  title,
  description,
  stats,
}: {
  state: StudioState;
  pill?: string;
  title: string;
  description: ReactNode;
  stats?: StudioStat[];
}) {
  return (
    <header className={classes.hero}>
      <div className={classes.heroHead}>
        <span key={state} className={classes.pill} data-state={state}>
          <span className={classes.pillDot} aria-hidden />
          {pill ?? PILL_TEXT[state]}
        </span>
        <Text component="h2" className={classes.heroTitle}>
          {title}
        </Text>
        <Text size="sm" c="dimmed" mt={8}>
          {description}
        </Text>
      </div>
      {stats && stats.length > 0 && (
        <div className={classes.stats}>
          {stats.map((stat) => (
            <div key={stat.label} className={classes.stat} data-tone={stat.tone}>
              <div className={classes.statValue}>{stat.value}</div>
              <Text size="xs" c="dimmed" mt={6}>
                {stat.label}
              </Text>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}

export function StudioSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={classes.section}>
      <div className={classes.sectionHead}>
        <Text fw={650} size="sm">
          {title}
        </Text>
        {description && (
          <Text size="xs" c="dimmed" mt={4}>
            {description}
          </Text>
        )}
        {action && <div className={classes.sectionAction}>{action}</div>}
      </div>
      <div className={classes.sectionBody}>{children}</div>
    </section>
  );
}

export function AsideBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={classes.block}>
      <div className={classes.label}>{label}</div>
      {children}
    </div>
  );
}

export function SetupChecklist({ items }: { items: { label: string; done: boolean }[] }) {
  return (
    <ul className={classes.checklist}>
      {items.map((item) => (
        <li key={item.label} className={classes.checkItem}>
          {item.done ? (
            <CircleCheck size={16} className={classes.checkDone} />
          ) : (
            <CircleDashed size={16} className={classes.checkOpen} />
          )}
          <Text size="sm" c={item.done ? undefined : "dimmed"}>
            {item.label}
          </Text>
        </li>
      ))}
    </ul>
  );
}

export function SecureNote({ children }: { children: ReactNode }) {
  return (
    <div className={classes.secure}>
      <LockKeyhole size={15} className={classes.secureIcon} />
      <Text size="xs" c="dimmed">
        {children}
      </Text>
    </div>
  );
}

export const studioClasses = classes;
