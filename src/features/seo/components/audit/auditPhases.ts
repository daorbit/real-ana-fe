export interface AuditPhase {
  duration: number;
  checks: string[];
}

export const AUDIT_PHASES: AuditPhase[] = [
  {
    duration: 3500,
    checks: ["Resolving DNS", "Opening a secure connection", "Downloading HTML"],
  },
  {
    duration: 5000,
    checks: ["Title length", "Meta description", "Open Graph tags", "Heading outline", "Image alt text"],
  },
  {
    duration: 6000,
    checks: ["Canonical URL", "robots.txt", "XML sitemap", "HTTPS and redirects", "Structured data"],
  },
  {
    duration: 16000,
    checks: ["Largest Contentful Paint", "Cumulative Layout Shift", "Interaction to Next Paint", "Accessibility", "Best practices"],
  },
  {
    duration: Infinity,
    checks: ["Weighing every check", "Ranking quick wins", "Writing recommendations"],
  },
];
