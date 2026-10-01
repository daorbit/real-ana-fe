import {
  Activity, ArrowDownToLine, Bug, Compass, CornerUpLeft, Eye, ExternalLink, FileText, Files, Flag, Gauge,
  Globe, Grid3x3, Languages, Layers, Link2, LogIn, LogOut, Maximize2, Megaphone, Monitor, MousePointerClick,
  PlaneLanding, Radio, Smartphone, Split, Tag, Target, Timer, TrendingUp, Trophy, Users,
  Percent, Medal, Search, FileSearch, ChartNoAxesColumn, Lightbulb,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { WidgetId } from "@/features/analytics/widgetCatalog";

export const WIDGET_ICON: Record<WidgetId, LucideIcon> = {
  visitors: Users,
  pageviews: Eye,
  live: Radio,
  sessions: Layers,
  bounce: CornerUpLeft,
  avgSession: Timer,
  pagesPerSession: Files,
  sites: Globe,
  traffic: TrendingUp,
  livePages: Activity,
  worldMap: Globe,
  clicks: MousePointerClick,
  heatmap: Grid3x3,
  seoScore: Gauge,
  targets: Target,
  topPages: FileText,
  entryPages: LogIn,
  exitPages: LogOut,
  topReferrers: Link2,
  topCountries: Flag,
  browsers: Compass,
  operatingSystems: Monitor,
  devices: Smartphone,
  screenSizes: Maximize2,
  languages: Languages,
  utmSources: Megaphone,
  utmCampaigns: Tag,
  scrollDepth: ArrowDownToLine,
  landingPages: PlaneLanding,
  channels: Split,
  goals: Trophy,
  outbound: ExternalLink,
  errors: Bug,
  searchClicks: MousePointerClick,
  searchImpressions: Eye,
  searchCtr: Percent,
  searchPosition: Medal,
  searchTrend: TrendingUp,
  searchQueries: Search,
  searchPages: FileSearch,
  searchRankings: ChartNoAxesColumn,
  searchOpportunities: Lightbulb,
};

export function widgetIcon(id: string): LucideIcon {
  return WIDGET_ICON[id as WidgetId] ?? FileText;
}
