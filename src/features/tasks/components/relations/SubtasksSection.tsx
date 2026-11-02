import { childrenOf } from "../../lib/relations";
import { useTaskIndex } from "../../hooks/TaskIndexContext";
import type { Task } from "../../types";
import { AddItemRow } from "../AddItemRow";
import { RelatedTaskRow } from "./RelatedTaskRow";
import classes from "../Tasks.module.css";

export function SubtasksSection({
  task,
  readOnly,
  onOpen,
  onToggleDone,
  onCreate,
  onDetach,
}: {
  task: Task;
  readOnly: boolean;
  onOpen: (task: Task) => void;
  onToggleDone: (task: Task) => void;
  onCreate: (title: string) => Promise<boolean>;
  onDetach: (task: Task) => void;
}) {
  const subtasks = childrenOf(useTaskIndex(), task.id);
  const done = subtasks.filter((t) => t.status === "done").length;

  return (
    <section className={classes.section}>
      <div className={classes.sectionHead}>
        <span className={classes.sectionTitle}>Subtasks</span>
        {subtasks.length > 0 && (
          <span className={classes.sectionMeta}>
            {done} / {subtasks.length}
          </span>
        )}
      </div>
      <div className={classes.checklist}>
        {subtasks.map((subtask) => (
          <RelatedTaskRow
            key={subtask.id}
            task={subtask}
            onOpen={onOpen}
            onToggleDone={readOnly ? undefined : onToggleDone}
            onRemove={readOnly ? undefined : onDetach}
            removeLabel={`Stop “${subtask.title}” being a subtask`}
          />
        ))}
        {!subtasks.length && (
          <span className={classes.sectionHint}>
            {readOnly ? "No subtasks." : "Split this into subtasks, each with its own owner and date."}
          </span>
        )}
        {!readOnly && <AddItemRow placeholder="Add subtask" ariaLabel="Add a subtask" onAdd={onCreate} />}
      </div>
    </section>
  );
}
