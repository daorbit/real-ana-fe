import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Card, Skeleton, Text } from "@mantine/core";
import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GoogleMark } from "@/shared/ui/GoogleMark";
import type { SearchConsoleTabId } from "@/features/searchConsole/searchConsoleTabs";
import classes from "@/features/searchConsole/widgets/searchWidgets.module.css";

export function SearchWidgetSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className={classes.skeleton}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={14} width={`${90 - i * 12}%`} radius="sm" />
      ))}
    </div>
  );
}

export function SearchWidgetCard({
  icon: Icon,
  title,
  subtitle,
  tab = "overview",
  children,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  tab?: SearchConsoleTabId;
  children: ReactNode;
}) {
  const to = tab === "overview" ? "/app/search-visibility" : `/app/search-visibility?tab=${tab}`;

  return (
    <Card withBorder radius="lg" padding="lg" className={classes.card}>
      <div className={classes.head}>
        <div className={classes.title}>
          <Icon size={15} className="sect-ic" />
          <div>
            <Text fw={600} c="dimmed" size="sm" truncate>{title}</Text>
            {subtitle && <div className={classes.sub}>{subtitle}</div>}
          </div>
        </div>
        <Link to={to} className={classes.source} aria-label={`Open ${title} in Search visibility`}>
          <GoogleMark size={11} />
          Google
          <ArrowUpRight size={11} />
        </Link>
      </div>
      <div className={classes.body}>{children}</div>
    </Card>
  );
}
