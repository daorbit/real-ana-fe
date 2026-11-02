import type {
  SeoContent, SeoIssue, SeoPerformance, SeoReportSummary, SeoSiteFiles, SeoTechnical,
} from "@/shared/types";
import { useIssueBreakdown } from "@/features/seo/components/hooks";
import { AuditSummaryCard } from "@/features/seo/components/overview/AuditSummaryCard";
import { SeverityCard } from "@/features/seo/components/overview/SeverityCard";
import { PageMetricsTiles } from "@/features/seo/components/overview/PageMetricsTiles";
import { ScoreTrendCard } from "@/features/seo/components/overview/ScoreTrendCard";
import { PriorityFixesCard } from "@/features/seo/components/overview/PriorityFixesCard";
import { TechChecksCard } from "@/features/seo/components/overview/TechChecksCard";
import { PagePreviewCard, pageScreenshots } from "@/features/seo/components/overview/PagePreviewCard";

export function OverviewPanel({
  data,
  history,
  onViewIssues,
}: {
  data: {
    score: number;
    url?: string;
    performance: SeoPerformance;
    issues: SeoIssue[];
    content: SeoContent;
    technical: SeoTechnical;
    siteFiles: SeoSiteFiles;
  };
  history: SeoReportSummary[];
  onViewIssues?: () => void;
}) {
  const { score, url, performance, issues, content, technical, siteFiles } = data;
  const breakdown = useIssueBreakdown(issues);
  const shots = pageScreenshots(performance);
  const hasPreview = Boolean(shots.mobile || shots.desktop);

  return (
    <div className="seo-bento">
      <AuditSummaryCard score={score} performance={performance} />
      <SeverityCard breakdown={breakdown} />
      <PageMetricsTiles content={content} technical={technical} performance={performance} />
      <ScoreTrendCard history={history} current={score} />
      <PriorityFixesCard breakdown={breakdown} onViewIssues={onViewIssues} />
      <TechChecksCard technical={technical} siteFiles={siteFiles} wide={!hasPreview} />
      {hasPreview && <PagePreviewCard performance={performance} url={url} />}
    </div>
  );
}
