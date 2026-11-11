import { CircleAlert, FileCode2, Gauge, HeartPulse, type LucideIcon } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { seoTabPath, type SeoTabId } from "../sections";

const COPY: Record<Exclude<SeoTabId, "overview">, { icon: LucideIcon; title: string; description: string }> = {
  issues: {
    icon: CircleAlert,
    title: "No issues to show yet",
    description: "Run an audit on this site and every problem it finds is listed here, worst first.",
  },
  onpage: {
    icon: FileCode2,
    title: "No on-page checks yet",
    description: "After an audit, this shows the page's meta tags, content, images and structured data.",
  },
  performance: {
    icon: Gauge,
    title: "No performance data yet",
    description: "After an audit, Lighthouse scores, Core Web Vitals and speed fixes appear here.",
  },
  site: {
    icon: HeartPulse,
    title: "No site health checks yet",
    description: "After an audit, this shows the technical setup, links, crawl and AI search access.",
  },
};

export function SeoTabEmpty({ tab, canEdit }: { tab: Exclude<SeoTabId, "overview">; canEdit: boolean }) {
  const { icon, title, description } = COPY[tab];
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={canEdit ? description : `${description} Ask an editor to run the first audit.`}
      action={{ label: canEdit ? "Run an audit" : "Open overview", to: seoTabPath("overview") }}
    />
  );
}
