import { num } from "@/shared/lib/format";
import type { AuditSummary } from "@/shared/types";
import { CATEGORY_META, WORKSPACE_CATEGORIES, type WorkspaceAuditCategory } from "../lib/categories";
import classes from "./AreaChips.module.css";

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

  return (
    <div className={classes.chips} role="group" aria-label="Filter by area">
      <button
        type="button"
        className={classes.chip}
        data-active={!category || undefined}
        aria-pressed={!category}
        onClick={() => onCategory(null)}
      >
        All activity
        {summary && <span className={classes.count}>{num(summary.total)}</span>}
      </button>
      {shown.map((c) => {
        const { label, icon: Icon } = CATEGORY_META[c];
        const active = category === c;
        return (
          <button
            key={c}
            type="button"
            className={classes.chip}
            data-active={active || undefined}
            aria-pressed={active}
            onClick={() => onCategory(active ? null : c)}
          >
            <Icon size={13} />
            {label}
            <span className={classes.count}>{num(summary?.byCategory[c] ?? 0)}</span>
          </button>
        );
      })}
    </div>
  );
}
