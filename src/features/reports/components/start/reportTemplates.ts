import { BarChart3, Briefcase, Sun } from "lucide-react";
import type { Draft } from "@/features/reports/pages/types";

export type ReportTemplate = {
  id: string;
  icon: typeof Sun;
  title: string;
  text: string;
  cadence: string;
  stats: { label: string; value: string }[];
  bars: number[];
  summary: boolean;
  spreadsheet: boolean;
  dashboardLink: boolean;
  preset: Partial<Draft>;
};

export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: "weekly",
    icon: BarChart3,
    title: "Weekly summary",
    text: "The week's traffic and SEO with an AI write-up of what changed.",
    cadence: "Weekly",
    stats: [
      { label: "Visitors", value: "12.4k" },
      { label: "vs last week", value: "+18%" },
      { label: "SEO score", value: "92" },
    ],
    bars: [3, 5, 4, 6, 5, 7, 8],
    summary: true,
    spreadsheet: true,
    dashboardLink: false,
    preset: { name: "Weekly summary", frequency: "weekly" },
  },
  {
    id: "monthly",
    icon: Briefcase,
    title: "Monthly client report",
    text: "A month of results with a spreadsheet and a live dashboard link.",
    cadence: "Monthly",
    stats: [
      { label: "Visitors", value: "48.1k" },
      { label: "vs last month", value: "+9%" },
      { label: "Pageviews", value: "132k" },
    ],
    bars: [4, 4, 5, 6, 6, 7, 8],
    summary: true,
    spreadsheet: true,
    dashboardLink: true,
    preset: { name: "Monthly client report", frequency: "monthly", dashboardLink: true },
  },
  {
    id: "daily",
    icon: Sun,
    title: "Daily pulse",
    text: "Yesterday's visitors and top pages, short enough to read over coffee.",
    cadence: "Daily",
    stats: [
      { label: "Visitors", value: "1.8k" },
      { label: "vs day before", value: "-4%" },
      { label: "Top page views", value: "312" },
    ],
    bars: [6, 5, 7, 4, 6, 5, 6],
    summary: true,
    spreadsheet: false,
    dashboardLink: false,
    preset: { name: "Daily pulse", frequency: "daily", seo: false, attachXlsx: false },
  },
];
