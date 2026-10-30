import { Tooltip, UnstyledButton } from "@mantine/core";
import { ArrowDown, BellRing, CalendarDays, CircleAlert, X } from "lucide-react";
import { dueLabel, dueState, PRIORITY_LABEL, STATUS_LABEL } from "../lib/board";
import type { TaskLabel, TaskPriority, TaskStatus } from "../types";
import classes from "./Tasks.module.css";

const PRIORITY_ICON = { urgent: BellRing, high: CircleAlert, low: ArrowDown } as const;

export function PriorityIcon({ priority, size = 14 }: { priority: TaskPriority; size?: number }) {
  if (priority === "none" || priority === "medium") return null;
  const Icon = PRIORITY_ICON[priority];
  return (
    <Tooltip label={PRIORITY_LABEL[priority]} withArrow>
      <span className={classes.priority} data-level={priority} aria-label={PRIORITY_LABEL[priority]}>
        <Icon size={size} strokeWidth={2.4} />
      </span>
    </Tooltip>
  );
}

export function ProgressGlyph({ status, size = 18 }: { status: TaskStatus; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden>
      <circle cx="9" cy="9" r="7.25" fill={status === "done" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" />
      {status === "doing" && <path d="M9 1.75A7.25 7.25 0 0 1 9 16.25Z" fill="currentColor" />}
      {status === "done" && (
        <path d="M5.6 9.2l2.2 2.2 4.6-4.8" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export function ProgressButton({
  status,
  disabled,
  onToggle,
  size = 18,
}: {
  status: TaskStatus;
  disabled?: boolean;
  onToggle: () => void;
  size?: number;
}) {
  return (
    <Tooltip label={status === "done" ? "Mark as not started" : "Mark as complete"} withArrow disabled={disabled}>
      <UnstyledButton
        className={classes.progress}
        data-status={status}
        disabled={disabled}
        onClick={onToggle}
        aria-label={status === "done" ? "Mark as not started" : "Mark as complete"}
      >
        <ProgressGlyph status={status} size={size} />
      </UnstyledButton>
    </Tooltip>
  );
}

export function LabelPill({ label, onRemove }: { label: TaskLabel; onRemove?: () => void }) {
  return (
    <span className={classes.label} data-color={label.color}>
      {label.text}
      {onRemove && (
        <UnstyledButton className={classes.labelRemove} onClick={onRemove} aria-label={`Remove ${label.text}`}>
          <X size={11} strokeWidth={2.6} />
        </UnstyledButton>
      )}
    </span>
  );
}

export function DueChip({ dueDate, status, label }: { dueDate: string; status: TaskStatus; label?: string }) {
  const state = dueState(dueDate, status);
  return (
    <span className={classes.due} data-state={status === "done" ? "done" : state ?? undefined}>
      <CalendarDays size={12} />
      {label ?? dueLabel(dueDate, state)}
    </span>
  );
}

export function StatusText({ status }: { status: TaskStatus }) {
  return (
    <span className={classes.statusBadge}>
      <span className={classes.progress} data-status={status}>
        <ProgressGlyph status={status} size={15} />
      </span>
      {STATUS_LABEL[status]}
    </span>
  );
}
