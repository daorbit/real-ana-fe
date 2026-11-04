import { Skeleton } from "@mantine/core";
import { num } from "@/shared/lib/format";
import type { AuditSummary } from "@/shared/types";
import { CATEGORY_META, WORKSPACE_CATEGORIES, type WorkspaceAuditCategory } from "../lib/categories";
import classes from "./AreaChips.module.css";

const TAB_SKELETON_WIDTHS = [84, 72, 92, 44, 80];

export function AreaChips({
  summary,
  category,
  onCategory,
}: {
  summary: AuditSummary | null;
  category: WorkspaceAuditCategory | null;
  onCategory: (next: WorkspaceAuditCategory | null) => void;
}) {
  const shown = WORKSPACE_CATEGORIES.filter((c) => (summary?.byCategory[c] ?? 0) > 0 || c === category);

  if (!summary) {
    return (
      <div className={classes.tabs} aria-hidden>
        {TAB_SKELETON_WIDTHS.map((width) => (
          <span key={width} className={classes.tabSkeleton}>
            <Skeleton height={12} width={width} radius="sm" />
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={classes.tabs} role="group" aria-label="Filter by area">
      <button
        type="button"
        className={classes.tab}
        data-active={!category || undefined}
        aria-pressed={!category}
        onClick={() => onCategory(null)}
      >
        All activity
        {summary && <span className={classes.count}>{num(summary.total)}</span>}
      </button>
      {shown.map((c) => {
        const active = category === c;
        return (
          <button
            key={c}
            type="button"
            className={classes.tab}
            data-active={active || undefined}
            aria-pressed={active}
            onClick={() => onCategory(c)}
          >
            {CATEGORY_META[c].label}
            <span className={classes.count}>{num(summary?.byCategory[c] ?? 0)}</span>
          </button>
        );
      })}
    </div>
  );
}
