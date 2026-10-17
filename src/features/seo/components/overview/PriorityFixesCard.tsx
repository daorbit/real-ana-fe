import { Card } from "@mantine/core";
import { ArrowRight, CircleCheck } from "lucide-react";
import { useIssueBreakdown } from "@/features/seo/components/hooks";
import { SEVERITY } from "@/features/seo/components/shared/Panel";
import { AREA_LABEL } from "@/features/seo/components/utils";
import classes from "./overviewCards.module.css";

export function PriorityFixesCard({
  breakdown,
  onViewIssues,
}: {
  breakdown: ReturnType<typeof useIssueBreakdown>;
  onViewIssues?: () => void;
}) {
  const { priority, total } = breakdown;

  return (
    <Card withBorder radius="md" padding="lg" className="col-7 seo-panel">
      <div className={classes.head}>
        <span className={classes.title}>Priority fixes</span>
        <span className="seo-eyebrow">Worst first</span>
      </div>

      {priority.length ? (
        <>
          <ol className={classes.fixList}>
            {priority.map((issue, index) => (
              <li key={`${issue.title}-${index}`} className={classes.fix}>
                <span className={classes.rank} data-sev={issue.severity}>
                  {index + 1}
                </span>
                <div className={classes.fixBody}>
                  <div className={classes.fixTitle}>{issue.title}</div>
                  <div className={classes.fixDetail}>{issue.detail}</div>
                  <div className={classes.fixMeta}>
                    <span className={classes.sev} data-sev={issue.severity}>
                      <span className={classes.dot} />
                      {SEVERITY[issue.severity].label}
                    </span>
                    <span className={classes.areaTag}>{AREA_LABEL[issue.area]}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          {onViewIssues && total > priority.length && (
            <div className={classes.footer}>
              <button type="button" className={classes.viewAll} onClick={onViewIssues}>
                View all {total} issues
                <ArrowRight size={13} aria-hidden />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={classes.empty}>
          <CircleCheck size={16} aria-hidden />
          Every check came back clean.
        </div>
      )}
    </Card>
  );
}
