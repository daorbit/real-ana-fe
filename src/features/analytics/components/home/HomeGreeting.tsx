import { TrendingDown, TrendingUp } from "lucide-react";
import { timeAgo } from "@/shared/lib";
import type { LastVisit } from "@/features/analytics/hooks/useLastVisit";
import classes from "@/features/analytics/components/home/HomeGreeting.module.css";

function greetingFor(hour: number): string {
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function Change({ label, value }: { label: string; value: number | null }) {
  if (value === null) return null;
  const tone = value > 0 ? "up" : value < 0 ? "down" : "flat";
  const Icon = value < 0 ? TrendingDown : TrendingUp;
  return (
    <span className={classes.change} data-tone={tone}>
      <Icon size={12} />
      {label} {value > 0 ? "+" : ""}
      {value}%
    </span>
  );
}

export function HomeGreeting({ firstName, last }: { firstName: string; last: LastVisit | null }) {
  const name = firstName.trim();

  return (
    <div className={classes.root}>
      <p className={classes.title}>
        {greetingFor(new Date().getHours())}
        {name ? `, ${name}` : ""}
      </p>
      {last && (
        <span className={classes.since}>
          Since your last visit {timeAgo(last.at)}
          <Change label="visitors" value={last.visitors} />
          <Change label="pageviews" value={last.pageviews} />
        </span>
      )}
    </div>
  );
}
