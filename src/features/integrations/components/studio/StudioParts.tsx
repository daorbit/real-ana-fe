import { useContext, type ReactNode } from "react";
import { Text } from "@mantine/core";
import { CircleCheck, CircleDashed, LockKeyhole } from "lucide-react";
import { StudioFacts, type StudioFact } from "./StudioFacts";
import { StudioAsideContext } from "./studioAsideContext";
import classes from "./StudioParts.module.css";

export type StudioState = "live" | "saved" | "off";

export interface StudioStat {
  label: string;
  value: ReactNode;
  tone?: "ok" | "warn";
}

const STATE_TEXT: Record<StudioState, string> = {
  live: "Live",
  saved: "Needs attention",
  off: "Not connected",
};

const STATE_TONE: Record<StudioState, StudioFact["tone"]> = {
  live: "on",
  saved: "warn",
  off: undefined,
};

function factsFor(state: StudioState, pill: string | undefined, stats: StudioStat[]): StudioFact[] {
  const facts: StudioFact[] = stats.map((stat) => ({
    label: stat.label,
    value: stat.value,
    tone: stat.tone === "ok" ? "on" : stat.tone,
  }));
  if (stats.some((stat) => stat.label === "Status")) return facts;
  return [{ label: "Status", value: pill ?? STATE_TEXT[state], tone: STATE_TONE[state] }, ...facts];
}

export function StudioAside() {
  const aside = useContext(StudioAsideContext);
  if (!aside) return null;
  return <section className={classes.asideGrid}>{aside}</section>;
}

export function StudioHero({
  state,
  pill,
  title,
  description,
  stats = [],
}: {
  state: StudioState;
  pill?: string;
  title: string;
  description: ReactNode;
  stats?: StudioStat[];
}) {
  return (
    <>
      <StudioFacts facts={factsFor(state, pill, stats)} />
      <section className={classes.overview}>
        <Text component="h2" className={classes.overviewTitle}>
          {title}
        </Text>
        <Text className={classes.overviewDescription}>{description}</Text>
      </section>
      <StudioAside />
    </>
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
        <Text className={classes.sectionTitle}>{title}</Text>
        {description && <Text className={classes.sectionDescription}>{description}</Text>}
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
