import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button, Card } from "@mantine/core";
import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import classes from "@/shared/ui/HomeWidgetCard.module.css";

export function HomeWidgetCard({
  icon: Icon,
  title,
  meta,
  to,
  actionLabel = "Open",
  children,
}: {
  icon: LucideIcon;
  title: string;
  meta?: ReactNode;
  to?: string;
  actionLabel?: string;
  children: ReactNode;
}) {
  return (
    <Card withBorder radius="lg" padding="lg" className={classes.card}>
      <div className={classes.head}>
        <Icon size={15} className="sect-ic" />
        <span className={classes.title}>{title}</span>
        {meta && <span className={classes.meta}>{meta}</span>}
        <span className={classes.spacer} />
        {to && (
          <Button component={Link} to={to} variant="subtle" size="xs" rightSection={<ArrowUpRight size={14} />}>
            {actionLabel}
          </Button>
        )}
      </div>
      <div className={classes.body}>{children}</div>
    </Card>
  );
}

export function WidgetStats({ children }: { children: ReactNode }) {
  return <div className={classes.stats}>{children}</div>;
}

export function WidgetList({ children }: { children: ReactNode }) {
  return <ul className={classes.list}>{children}</ul>;
}

export function WidgetRow({
  lead,
  title,
  sub,
  end,
  endTone,
}: {
  lead?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  end?: ReactNode;
  endTone?: "good" | "bad";
}) {
  return (
    <li className={classes.row}>
      {lead}
      <span className={classes.rowMain}>
        <span className={classes.rowTitle}>{title}</span>
        {sub && <span className={classes.rowSub}>{sub}</span>}
      </span>
      {end !== undefined && <span className={classes.rowEnd} data-tone={endTone}>{end}</span>}
    </li>
  );
}

export function WidgetEmpty({ children }: { children: ReactNode }) {
  return <div className={classes.empty}>{children}</div>;
}

export function WidgetStat({ label, value, tone }: { label: string; value: ReactNode; tone?: "good" | "bad" | "warn" }) {
  return (
    <div className={classes.stat}>
      <span className={classes.statLabel}>{label}</span>
      <span className={classes.statValue} data-tone={tone}>{value}</span>
    </div>
  );
}
