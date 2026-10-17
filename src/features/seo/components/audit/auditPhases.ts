import { ClipboardCheck, Gauge, Globe, Tags, Wrench, type LucideIcon } from "lucide-react";

export interface AuditPhase {
  title: string;
  duration: number;
  checks: string[];
  icon: LucideIcon;
}

export const AUDIT_PHASES: AuditPhase[] = [
  {
    title: "Fetching the page",
    duration: 3500,
    checks: ["Resolving DNS", "Opening a secure connection", "Downloading HTML"],
    icon: Globe,
  },
  {
    title: "Reading meta tags and headings",
    duration: 5000,
    checks: ["Title length", "Meta description", "Open Graph tags", "Heading outline", "Image alt text"],
    icon: Tags,
  },
  {
    title: "Checking technical setup",
    duration: 6000,
    checks: ["Canonical URL", "robots.txt", "XML sitemap", "HTTPS and redirects", "Structured data"],
    icon: Wrench,
  },
  {
    title: "Running Lighthouse",
    duration: 16000,
    checks: ["Largest Contentful Paint", "Cumulative Layout Shift", "Interaction to Next Paint", "Accessibility", "Best practices"],
    icon: Gauge,
  },
  {
    title: "Scoring and building the report",
    duration: Infinity,
    checks: ["Weighing every check", "Ranking quick wins", "Writing recommendations"],
    icon: ClipboardCheck,
  },
];
