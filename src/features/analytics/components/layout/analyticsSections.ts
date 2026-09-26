import type { TFunction } from "i18next";
import {
  AlertTriangle, AppWindow, ArrowDownWideNarrow, Eye, GitBranch, Globe2, LayoutDashboard,
  MousePointerClick, Repeat, Tag, Target, Waypoints, Zap, type LucideIcon,
} from "lucide-react";

export type AnalyticsTab = { value: string; label: string; icon: LucideIcon };

export type AnalyticsSection = AnalyticsTab & { tabs: AnalyticsTab[] };

export function getAnalyticsSections(t: TFunction): AnalyticsSection[] {
  return [
    { value: "overview", label: t("analytics.sec.overview"), icon: LayoutDashboard, tabs: [] },
    {
      value: "behavior",
      label: t("analytics.sec.behavior"),
      icon: ArrowDownWideNarrow,
      tabs: [
        { value: "pages", label: t("analytics.tab.pages"), icon: Eye },
        { value: "engagement", label: t("analytics.tab.engagement"), icon: ArrowDownWideNarrow },
        { value: "clicks", label: t("analytics.tab.clicks"), icon: MousePointerClick },
      ],
    },
    {
      value: "acquisition",
      label: t("analytics.sec.acquisition"),
      icon: Tag,
      tabs: [
        { value: "sources", label: t("analytics.tab.sources"), icon: Tag },
        { value: "geo", label: t("analytics.tab.geo"), icon: Globe2 },
        { value: "tech", label: t("analytics.tab.tech"), icon: AppWindow },
      ],
    },
    {
      value: "conversion",
      label: t("analytics.sec.conversion"),
      icon: Target,
      tabs: [
        { value: "flow", label: t("analytics.tab.flow"), icon: Waypoints },
        { value: "funnel", label: t("analytics.tab.funnel"), icon: GitBranch },
        { value: "goals", label: t("analytics.tab.goals"), icon: Target },
        { value: "events", label: t("analytics.tab.events"), icon: Zap },
        { value: "retention", label: t("analytics.tab.retention"), icon: Repeat },
        { value: "errors", label: t("analytics.tab.errors"), icon: AlertTriangle },
      ],
    },
  ];
}
