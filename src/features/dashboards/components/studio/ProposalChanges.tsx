import { Minus, PenLine, Plus } from "lucide-react";
import type { DraftChange, DraftChangeKind } from "@/features/dashboards/draftChanges";
import classes from "@/features/dashboards/components/studio/Studio.module.css";

const VISIBLE = 7;

const ICON: Record<DraftChangeKind, typeof Plus> = { add: Plus, remove: Minus, edit: PenLine };

export function ProposalChanges({ changes }: { changes: DraftChange[] }) {
  if (changes.length === 0) return null;
  const hidden = changes.length - VISIBLE;

  return (
    <ul className={classes.changes} aria-label="What changes">
      {changes.slice(0, VISIBLE).map((c) => {
        const Icon = ICON[c.kind];
        return (
          <li key={`${c.kind}-${c.label}`} className={classes.change} data-kind={c.kind}>
            <span className={classes.changeIcon}><Icon size={10} strokeWidth={2.8} /></span>
            <span className={classes.changeLabel}>{c.label}</span>
          </li>
        );
      })}
      {hidden > 0 && <li className={classes.changeMore}>+{hidden} more</li>}
    </ul>
  );
}
