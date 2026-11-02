import { Anchor, Tooltip } from "@mantine/core";
import { Clock, ExternalLink } from "lucide-react";
import type { SeoReport, SeoReportData } from "@/shared/types";
import { dateTime, timeAgo } from "@/shared/lib";
import { Pill } from "@/features/seo/components/shared/Pill";
import layout from "./SeoLayout.module.css";

export function ReportMeta({
  report,
  data,
  viewingOld,
  onBackToLatest,
}: {
  report: SeoReport;
  data: SeoReportData;
  viewingOld: boolean;
  onBackToLatest: () => void;
}) {
  const both = Boolean(data.performance.desktop && data.performance.mobile);

  return (
    <div className={layout.reportMeta}>
      {viewingOld ? (
        <>
          <span className={layout.viewingOld}>
            <Clock size={12} />
            Viewing an older audit
          </span>
          <Anchor component="button" type="button" size="xs" onClick={onBackToLatest}>
            Back to latest
          </Anchor>
          <span className={layout.metaDot} />
        </>
      ) : (
        <span className={layout.liveDot} aria-hidden />
      )}
      <Tooltip label={dateTime(report.createdAt)} withArrow>
        <span>
          Audited {timeAgo(report.createdAt)}
          {both ? " · Desktop and mobile" : ""}
        </span>
      </Tooltip>
      {data.finalUrl !== data.url && (
        <Tooltip label={`Redirected from ${data.url}`} withArrow>
          <span>
            <Pill tone="warn">Redirected</Pill>
          </span>
        </Tooltip>
      )}
      <Tooltip label={data.finalUrl} withArrow>
        <a
          className={layout.reportUrl}
          href={data.finalUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${data.finalUrl}`}
        >
          <ExternalLink size={13} />
        </a>
      </Tooltip>
    </div>
  );
}
