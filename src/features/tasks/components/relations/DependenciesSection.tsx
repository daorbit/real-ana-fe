import { blockedTasksOf, linkCandidates } from "../../lib/relations";
import { useTaskIndex } from "../../hooks/TaskIndexContext";
import type { Task } from "../../types";
import { RelatedTaskRow } from "./RelatedTaskRow";
import { TaskPicker } from "./TaskPicker";
import classes from "../Tasks.module.css";

const MAX_BLOCKERS = 20;

export function DependenciesSection({
  task,
  blockedBy,
  tasks,
  readOnly,
  onOpen,
  onBlockedByChange,
  onBlocksChange,
}: {
  task: Task | null;
  blockedBy: string[];
  tasks: Task[];
  readOnly: boolean;
  onOpen: (task: Task) => void;
  onBlockedByChange: (ids: string[]) => void;
  onBlocksChange: (other: Task, blocks: boolean) => void;
}) {
  const index = useTaskIndex();
  const blockers = blockedBy.map((id) => index.byId.get(id)).filter((t): t is Task => Boolean(t));
  const blocks = task ? blockedTasksOf(index, task.id) : [];
  const blocksIds = blocks.map((t) => t.id);
  const selfId = task?.id ?? null;

  return (
    <section className={classes.section}>
      <span className={classes.sectionTitle}>Dependencies</span>
      <div className={classes.dependencies}>
        <div className={classes.checklist}>
          <span className={classes.propLabel}>Blocked by</span>
          {blockers.map((blocker) => (
            <RelatedTaskRow
              key={blocker.id}
              task={blocker}
              onOpen={onOpen}
              onRemove={readOnly ? undefined : () => onBlockedByChange(blockedBy.filter((id) => id !== blocker.id))}
              removeLabel={`Remove ${blocker.title} from blockers`}
            />
          ))}
          {!readOnly && blockedBy.length < MAX_BLOCKERS && (
            <TaskPicker
              candidates={linkCandidates(tasks, selfId, [...blockedBy, ...blocksIds])}
              placeholder="Add a task that must finish first"
              onPick={(id) => onBlockedByChange([...blockedBy, id])}
            />
          )}
          {readOnly && !blockers.length && <span className={classes.sectionHint}>Nothing.</span>}
        </div>
        {task && (
          <div className={classes.checklist}>
            <span className={classes.propLabel}>Blocks</span>
            {blocks.map((other) => (
              <RelatedTaskRow
                key={other.id}
                task={other}
                onOpen={onOpen}
                onRemove={readOnly ? undefined : () => onBlocksChange(other, false)}
                removeLabel={`Stop blocking ${other.title}`}
              />
            ))}
            {!readOnly && (
              <TaskPicker
                candidates={linkCandidates(tasks, selfId, [...blockedBy, ...blocksIds]).filter(
                  (t) => t.blockedBy.length < MAX_BLOCKERS,
                )}
                placeholder="Add a task that waits on this one"
                onPick={(id) => {
                  const other = index.byId.get(id);
                  if (other) onBlocksChange(other, true);
                }}
              />
            )}
            {readOnly && !blocks.length && <span className={classes.sectionHint}>Nothing.</span>}
          </div>
        )}
      </div>
    </section>
  );
}
