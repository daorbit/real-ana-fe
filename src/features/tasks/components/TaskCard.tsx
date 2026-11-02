import { Tooltip, UnstyledButton } from "@mantine/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CheckSquare, CornerDownRight, Link2, ListTree, Lock } from "lucide-react";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import type { WorkspaceMember } from "@/shared/types";
import type { Task } from "../types";
import { dueLabel, dueState, PRIORITY_LABEL, taskKey } from "../lib/board";
import { shortDate } from "../lib/dates";
import { openBlockers, subtaskProgress } from "../lib/relations";
import { taskNotesPlainText } from "../lib/taskNotes";
import { useTaskIndex } from "../hooks/TaskIndexContext";
import { DueChip, LabelPill, PriorityIcon, ProgressButton, ProgressGlyph, StartChip } from "./TaskBits";
import { TaskCardMenu } from "./TaskCardMenu";
import classes from "./Tasks.module.css";

const CARD_CHECK_ITEMS = 8;
const CARD_AVATARS = 3;

type CardProps = {
  task: Task;
  assignees: WorkspaceMember[];
  canEdit: boolean;
  onOpen: (task: Task) => void;
  onToggleDone: (task: Task) => void;
  onDelete?: (task: Task) => void;
};

function dueChipLabel(task: Task, state: ReturnType<typeof dueState>): string | undefined {
  if (!task.dueDate) return undefined;
  const due =
    state === "overdue"
      ? `Overdue · ${dueLabel(task.dueDate, state)}`
      : state === "soon"
        ? `Due ${dueLabel(task.dueDate, state)}`
        : dueLabel(task.dueDate, state);
  return task.startDate ? `${shortDate(task.startDate)} – ${dueLabel(task.dueDate, state)}` : due;
}

export function TaskCardView({ task, assignees, canEdit, onOpen, onToggleDone, onDelete }: CardProps) {
  const index = useTaskIndex();
  const checked = task.checklist.filter((c) => c.done).length;
  const state = dueState(task.dueDate, task.status);
  const parent = task.parentId ? index.byId.get(task.parentId) : undefined;
  const blockers = openBlockers(index, task);
  const subtasks = subtaskProgress(index, task.id);

  return (
    <div className={classes.cardBody}>
      {parent && (
        <span className={classes.cardParent}>
          <CornerDownRight size={13} />
          <span className={classes.key}>{taskKey(parent.key)}</span>
          <span className={classes.cardParentTitle}>{parent.title}</span>
        </span>
      )}
      <div className={classes.titleRow}>
        <ProgressButton status={task.status === "done" ? "done" : "todo"} disabled={!canEdit} onToggle={() => onToggleDone(task)} />
        <UnstyledButton className={classes.cardOpen} onClick={() => onOpen(task)}>
          <span className={classes.cardTitle}>{task.title}</span>
        </UnstyledButton>
        {canEdit && onDelete && <TaskCardMenu task={task} onOpen={onOpen} onDelete={onDelete} />}
      </div>
      {task.notes && <p className={classes.cardNotes}>{taskNotesPlainText(task.notes)}</p>}
      {task.checklistOnCard && task.checklist.length > 0 && (
        <div className={classes.cardChecklist}>
          {task.checklist.slice(0, CARD_CHECK_ITEMS).map((item) => (
            <span key={item.id} className={classes.cardCheckItem} data-done={item.done || undefined}>
              <span className={classes.progress} data-status={item.done ? "done" : "todo"}>
                <ProgressGlyph status={item.done ? "done" : "todo"} size={14} />
              </span>
              {item.text}
            </span>
          ))}
        </div>
      )}
      <div className={classes.cardMeta}>
        <span className={classes.key}>{taskKey(task.key)}</span>
        {task.status === "doing" && (
          <span className={classes.statusTag}>
            <ProgressGlyph status="doing" size={11} />
            In progress
          </span>
        )}
        {blockers.length > 0 && (
          <Tooltip label={`Blocked by ${blockers.map((b) => taskKey(b.key)).join(", ")}`} withArrow>
            <span className={classes.blocked}>
              <Lock size={11} />
              Blocked
            </span>
          </Tooltip>
        )}
        {task.labels.map((l) => (
          <LabelPill key={l.text} label={l} />
        ))}
        {task.priority !== "none" && (
          <span className={classes.cardPriority} data-level={task.priority}>
            <PriorityIcon priority={task.priority} size={12} />
            {PRIORITY_LABEL[task.priority]}
          </span>
        )}
        {task.dueDate ? (
          <DueChip dueDate={task.dueDate} status={task.status} label={dueChipLabel(task, state)} />
        ) : task.startDate ? (
          <StartChip startDate={task.startDate} />
        ) : null}
        {task.checklist.length > 0 && (
          <span className={classes.meta}>
            <CheckSquare size={12} />
            {checked}/{task.checklist.length}
          </span>
        )}
        {subtasks && (
          <Tooltip label="Subtasks done" withArrow>
            <span className={classes.meta}>
              <ListTree size={12} />
              {subtasks.done}/{subtasks.total}
            </span>
          </Tooltip>
        )}
        {task.link && (
          <Tooltip label="Has link" withArrow>
            <span className={classes.meta}>
              <Link2 size={13} />
            </span>
          </Tooltip>
        )}
        {assignees.length > 0 && (
          <span className={classes.footEnd}>
            <span className={classes.assigneeAvatars}>
              {assignees.slice(0, CARD_AVATARS).map((assignee) => (
                <Tooltip key={assignee.userId} label={assignee.name || assignee.email} withArrow>
                  <span className={classes.cardAvatar}>
                    <UserAvatar src={assignee.avatarUrl} name={assignee.name || assignee.email} size={22} radius="xl" />
                  </span>
                </Tooltip>
              ))}
              {assignees.length > CARD_AVATARS && <span className={classes.assigneeOverflow}>+{assignees.length - CARD_AVATARS}</span>}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

export function TaskCard(props: CardProps) {
  const { task, canEdit } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !canEdit,
  });

  return (
    <div
      ref={setNodeRef}
      className={classes.card}
      data-placeholder={isDragging || undefined}
      data-done={task.status === "done" || undefined}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("button, a, input, select, textarea")) return;
        props.onOpen(task);
      }}
      {...attributes}
      {...listeners}
    >
      <TaskCardView {...props} />
    </div>
  );
}

export function TaskCardOverlay(props: CardProps) {
  return (
    <div className={classes.card} data-overlay data-done={props.task.status === "done" || undefined}>
      <TaskCardView {...props} />
    </div>
  );
}
