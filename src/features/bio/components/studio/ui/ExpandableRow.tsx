import type { ReactNode } from "react";
import { ChevronDown, GripVertical } from "lucide-react";
import type { DragHandleProps } from "@/shared/ui/SortableList";
import classes from "./List.module.css";

export function ExpandableRow({
  lead,
  title,
  subtitle,
  missing = false,
  off = false,
  open,
  handle,
  trailing,
  onToggle,
  children,
}: {
  lead: ReactNode;
  title: string;
  subtitle: string;
  missing?: boolean;
  off?: boolean;
  open: boolean;
  handle: DragHandleProps;
  trailing?: ReactNode;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className={classes.row} data-open={open || undefined} data-off={off || undefined}>
      <div className={classes.line}>
        <button type="button" className={classes.grip} aria-label={`Drag to reorder ${title}`} {...handle}>
          <GripVertical size={14} />
        </button>
        <button type="button" className={classes.main} aria-expanded={open} onClick={onToggle}>
          <span className={classes.lead}>{lead}</span>
          <span className={classes.text}>
            <span className={classes.title}>{title}</span>
            <span className={classes.sub} data-missing={missing || undefined}>
              {subtitle}
            </span>
          </span>
        </button>
        {trailing}
        <button type="button" className={classes.chevron} aria-label={open ? "Close" : "Edit"} onClick={onToggle}>
          <ChevronDown size={16} />
        </button>
      </div>
      {open && <div className={classes.details}>{children}</div>}
    </div>
  );
}

export function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className={classes.field}>
      <span className={classes.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}
