import type { ReactNode } from "react";
import {
  Users, Eye, Radio, Globe, MousePointerClick, Timer, Layers, Globe2, ArrowUpRight,
  LogIn, LogOut, AppWindow, MonitorSmartphone, Languages, Tag, Split,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { RankTone } from "@/shared/ui/rank/tones";
import { countryLabel, duration } from "@/shared/lib";
import { CountryFlag } from "@/shared/ui/CountryFlag";
import type { Bucket, Stats } from "@/shared/types";
import classes from "@/features/analytics/components/widgets/Widgets.module.css";

export type MetricSource = {
  icon: LucideIcon;
  label: string;
  value: number | string;
  color: string;
  delta?: number | null;
  inverseDelta?: boolean;
  live?: boolean;
  spark?: Stats["timeseries"];
  sparkKey?: string;
};

export const METRIC_TONE: Record<string, string> = {
  emerald: "#059669",
  green: "#10b981",
  cyan: "#0ea5e9",
  amber: "#d97706",
  pink: "#ec4899",
};

export type ListSource = {
  title: string;
  icon: LucideIcon;
  tone: RankTone;
  chart?: "list" | "donut";
  items: Bucket[];
  empty: string;
  format?: (key: string) => ReactNode;
};

function flag(key: string) {
  return (
    <span>
      <span className={classes.flag}><CountryFlag code={key} size={14} /></span>
      {countryLabel(key)}
    </span>
  );
}

export function metricSources(
  stats: Partial<Stats> | null,
  live: number,
  siteCount: number,
): Record<string, MetricSource> {
  const d = stats?.deltas;
  const series = stats?.timeseries ?? [];
  return {
    visitors: { icon: Users, label: "Visitors", value: stats?.visitors ?? 0, color: "emerald", delta: d?.visitors ?? null, spark: series, sparkKey: "visitors" },
    pageviews: { icon: Eye, label: "Pageviews", value: stats?.pageviews ?? 0, color: "cyan", delta: d?.pageviews ?? null, spark: series, sparkKey: "views" },
    live: { icon: Radio, label: "Live now", value: live, color: "green", live: true },
    sessions: { icon: Layers, label: "Sessions", value: stats?.sessions ?? 0, color: "amber", delta: d?.sessions ?? null },
    bounce: { icon: MousePointerClick, label: "Bounce rate", value: `${stats?.bounceRate ?? 0}%`, color: "pink", delta: d?.bounceRate ?? null, inverseDelta: true },
    avgSession: { icon: Timer, label: "Avg. session", value: duration(stats?.avgSessionMs ?? 0), color: "emerald", delta: d?.avgSessionMs ?? null },
    pagesPerSession: { icon: Layers, label: "Pages / session", value: stats?.pagesPerSession ?? 0, color: "cyan", delta: d?.pagesPerSession ?? null },
    sites: { icon: Globe, label: "Sites", value: siteCount, color: "amber" },
  };
}

export function listSources(stats: Partial<Stats> | null): Record<string, ListSource> {
  return {
    topPages: { title: "Top pages", icon: Eye, tone: "teal", items: stats?.topPages ?? [], empty: "No pageviews yet" },
    entryPages: { title: "Entry pages", icon: LogIn, tone: "blue", items: stats?.entryPages ?? [], empty: "No sessions yet" },
    exitPages: { title: "Exit pages", icon: LogOut, tone: "pink", items: stats?.exitPages ?? [], empty: "No completed sessions yet" },
    topReferrers: { title: "Referrers", icon: ArrowUpRight, tone: "orange", items: stats?.topReferrers ?? [], empty: "No referrers yet" },
    topCountries: { title: "Countries", icon: Globe2, tone: "emerald", items: stats?.countries ?? [], empty: "No location data yet", format: flag },
    browsers: { title: "Browsers", icon: AppWindow, tone: "cyan", chart: "donut", items: stats?.browsers ?? [], empty: "No data yet" },
    operatingSystems: { title: "Operating systems", icon: MonitorSmartphone, tone: "blue", chart: "donut", items: stats?.operatingSystems ?? [], empty: "No data yet" },
    devices: { title: "Devices", icon: MonitorSmartphone, tone: "amber", chart: "donut", items: stats?.devices ?? [], empty: "No data yet" },
    screenSizes: { title: "Screen sizes", icon: MonitorSmartphone, tone: "violet", chart: "donut", items: stats?.screenSizes ?? [], empty: "No data yet" },
    languages: { title: "Languages", icon: Languages, tone: "indigo", items: stats?.languages ?? [], empty: "No data yet" },
    utmSources: { title: "UTM sources", icon: Tag, tone: "indigo", items: stats?.utmSources ?? [], empty: "No campaigns yet" },
    utmCampaigns: { title: "UTM campaigns", icon: Tag, tone: "violet", items: stats?.utmCampaigns ?? [], empty: "No campaigns yet" },
    channels: { title: "Channels", icon: Split, tone: "emerald", chart: "donut", items: stats?.channels ?? [], empty: "No traffic yet" },
  };
}
