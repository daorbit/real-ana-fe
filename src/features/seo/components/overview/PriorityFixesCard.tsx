import { ArrowRight, ChevronRight, CircleCheck } from "lucide-react";
import type { IssueBreakdown } from "@/features/seo/components/hooks";
import { SEVERITY } from "@/features/seo/components/shared/Panel";
import { SeoCard } from "@/features/seo/components/shared/SeoCard";
import { AREA_LABEL } from "@/features/seo/components/utils";
import classes from "./overviewCards.module.css";

export function PriorityFixesCard({
  breakdown,
  onViewIssues,
}: {
  breakdown: IssueBreakdown;
  onViewIssues?: () => void;
}) {
  const { priority, total } = breakdown;

  return (
    <SeoCard className="col-6" title="Priority fixes" right={<span className="seo-eyebrow">Worst first</span>}>
      {priority.length ? (
        <>
          <ol className={classes.fixList}>
            {priority.map((issue, index) => (
              <li key={`${issue.title}-${index}`} className={classes.fix}>
                <button
                  type="button"
                  className={classes.fixButton}
                  data-sev={issue.severity}
                  onClick={onViewIssues}
                  disabled={!onViewIssues}
                >
                  <span className={classes.dot} aria-hidden />
                  <span className={classes.fixText}>
                    <span className={classes.fixTitle}>{issue.title}</span>
                    <span className={classes.fixMeta}>
                      {SEVERITY[issue.severity].label} · {AREA_LABEL[issue.area]}
                    </span>
                  </span>
                  {onViewIssues && <ChevronRight size={14} className={classes.chev} aria-hidden />}
                </button>
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
    </SeoCard>
  );
}
