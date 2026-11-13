import { ActionIcon, Button, Modal, TextInput, Textarea, Tooltip, UnstyledButton } from "@mantine/core";
import { Link } from "react-router-dom";
import { CornerDownRight, ExternalLink, Link2 } from "lucide-react";
import { timeAgo } from "@/shared/lib/format";
import type { WorkspaceMember } from "@/shared/types";
import { taskKey } from "../lib/board";
import { parentCandidates } from "../lib/relations";
import { toPatch, useTaskEditor, type TaskForm } from "../hooks/useTaskEditor";
import { useTaskIndex } from "../hooks/TaskIndexContext";
import type { Bucket, Task, TaskLabel, TaskPatch } from "../types";
import { AssigneePicker } from "./AssigneePicker";
import { ChecklistEditor } from "./ChecklistEditor";
import { LabelEditor } from "./LabelEditor";
import { TaskNotesEditor } from "./TaskNotesEditor";
import { ProgressButton } from "./TaskBits";
import { DependenciesSection } from "./relations/DependenciesSection";
import { SubtasksSection } from "./relations/SubtasksSection";
import { TaskDialogHeader } from "./dialog/TaskDialogHeader";
import { TaskSettings } from "./dialog/TaskSettings";
import classes from "./Tasks.module.css";
import dialog from "./dialog/TaskDialog.module.css";

export function TaskDialog({
  opened,
  task,
  tasks,
  defaults,
  planName,
  buckets,
  members,
  memberMap,
  knownLabels,
  canEdit,
  creating,
  onClose,
  onCreate,
  onUpdate,
  onUpdateOther,
  onToggleDone,
  onCreateSubtask,
  onOpenTask,
  onDelete,
}: {
  opened: boolean;
  task: Task | null;
  tasks: Task[];
  defaults: Partial<TaskForm>;
  planName: string;
  buckets: Bucket[];
  members: WorkspaceMember[];
  memberMap: Map<string, WorkspaceMember>;
  knownLabels: TaskLabel[];
  canEdit: boolean;
  creating: boolean;
  onClose: () => void;
  onCreate: (patch: TaskPatch & { title: string }) => Promise<boolean>;
  onUpdate: (patch: TaskPatch) => void;
  onUpdateOther: (task: Task, patch: TaskPatch) => void;
  onToggleDone: (task: Task) => void;
  onCreateSubtask: (parent: Task, title: string) => Promise<boolean>;
  onOpenTask: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const { form, change, type, commit } = useTaskEditor(task, opened, { bucketId: buckets[0]?.id ?? null, ...defaults }, onUpdate);
  const index = useTaskIndex();
  const readOnly = !canEdit;
  const author = task?.createdBy ? memberMap.get(task.createdBy) : undefined;
  const parent = form.parentId ? index.byId.get(form.parentId) : undefined;
  const parents = parentCandidates(tasks, task, index);
  const canHaveSubtasks = Boolean(task && !task.parentId);
  const bucketName = buckets.find((b) => b.id === form.bucketId)?.name ?? null;
  const toggleDone = () => change({ status: form.status === "done" ? "todo" : "done" });

  const create = async () => {
    const ok = await onCreate({ ...toPatch(form), title: form.title.trim(), link: form.link.trim() });
    if (ok) onClose();
  };

  const makeSubtask = async (item: TaskForm["checklist"][number]) => {
    if (!task) return;
    if (await onCreateSubtask(task, item.text)) change({ checklist: form.checklist.filter((i) => i.id !== item.id) });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={920}
      withCloseButton={false}
      padding={0}
      radius="lg"
      overlayProps={{ backgroundOpacity: 0.5, blur: 6 }}
      classNames={{ content: dialog.content }}
    >
      <TaskDialogHeader
        planName={planName}
        bucketName={bucketName}
        task={task}
        canEdit={canEdit}
        done={form.status === "done"}
        onToggleDone={toggleDone}
        onDelete={onDelete}
        onClose={onClose}
      />

      <div className={dialog.body}>
        <div className={dialog.main}>
          <div className={classes.titleBlock}>
            <div className={classes.dialogTitleRow}>
              <span className={classes.dialogProgress}>
                <ProgressButton status={form.status} size={22} disabled={readOnly} onToggle={toggleDone} />
              </span>
              <Textarea
                className={classes.titleField}
                classNames={{ input: classes.titleInput }}
                variant="unstyled"
                autosize
                minRows={1}
                maxLength={200}
                placeholder="Task name"
                readOnly={readOnly}
                value={form.title}
                onChange={(e) => type("title", e.currentTarget.value)}
                onBlur={() => commit("title")}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), e.currentTarget.blur())}
                data-autofocus={!task || undefined}
                aria-label="Task name"
              />
            </div>
            {parent && (
              <UnstyledButton className={classes.parentCrumb} onClick={() => onOpenTask(parent)}>
                <CornerDownRight size={13} />
                Subtask of <span className={classes.key}>{taskKey(parent.key)}</span>
                <span className={classes.cardParentTitle}>{parent.title}</span>
              </UnstyledButton>
            )}
            <span className={classes.lastChanged}>
              {task
                ? `Last changed ${timeAgo(task.updatedAt)}${author ? ` · created by ${author.name || author.email}` : ""}`
                : "Not saved yet"}
            </span>
          </div>

          <section className={classes.section}>
            <span className={classes.sectionTitle}>Notes</span>
            <TaskNotesEditor
              readOnly={readOnly}
              value={form.notes}
              onChange={(notes) => type("notes", notes)}
              onBlur={() => commit("notes")}
            />
          </section>

          {task && canHaveSubtasks && (
            <SubtasksSection
              task={task}
              readOnly={readOnly}
              onOpen={onOpenTask}
              onToggleDone={onToggleDone}
              onCreate={(title) => onCreateSubtask(task, title)}
              onDetach={(subtask) => onUpdateOther(subtask, { parentId: null })}
            />
          )}

          <ChecklistEditor
            items={form.checklist}
            onCard={form.checklistOnCard}
            readOnly={readOnly}
            onChange={(checklist) => change({ checklist })}
            onCardChange={(checklistOnCard) => change({ checklistOnCard })}
            onMakeSubtask={canHaveSubtasks ? (item) => void makeSubtask(item) : undefined}
          />

          <DependenciesSection
            task={task}
            blockedBy={form.blockedBy}
            tasks={tasks}
            readOnly={readOnly}
            onOpen={onOpenTask}
            onBlockedByChange={(blockedBy) => change({ blockedBy })}
            onBlocksChange={(other, blocks) =>
              task &&
              onUpdateOther(other, {
                blockedBy: blocks ? [...other.blockedBy, task.id] : other.blockedBy.filter((id) => id !== task.id),
              })
            }
          />
        </div>

        <aside className={dialog.side} aria-label="Task details">
          <TaskSettings form={form} readOnly={readOnly} buckets={buckets} parent={parent} parents={parents} onChange={change} />

          <section className={classes.section}>
            <span className={classes.sectionTitle}>Assignees</span>
            <AssigneePicker
              value={form.assigneeIds}
              members={members}
              memberMap={memberMap}
              readOnly={readOnly}
              onChange={(assigneeIds) => change({ assigneeIds })}
            />
          </section>

          <section className={classes.section}>
            <span className={classes.sectionTitle}>Labels</span>
            <LabelEditor value={form.labels} known={knownLabels} readOnly={readOnly} onChange={(labels) => change({ labels })} />
          </section>

          <section className={classes.section}>
            <span className={classes.sectionTitle}>Link</span>
            <TextInput
              variant="filled"
              aria-label="Link"
              placeholder="https://… or a page like /app/seo"
              readOnly={readOnly}
              leftSection={<Link2 size={15} />}
              value={form.link}
              onChange={(e) => type("link", e.currentTarget.value)}
              onBlur={() => commit("link")}
              rightSection={
                task?.link ? (
                  task.link.startsWith("/app/") ? (
                    <Tooltip label="Open link" withArrow>
                      <ActionIcon component={Link} to={task.link} variant="subtle" color="gray" aria-label="Open link">
                        <ExternalLink size={15} />
                      </ActionIcon>
                    </Tooltip>
                  ) : (
                    <Tooltip label="Open link in a new tab" withArrow>
                      <ActionIcon component="a" href={task.link} target="_blank" rel="noopener noreferrer" variant="subtle" color="gray" aria-label="Open link">
                        <ExternalLink size={15} />
                      </ActionIcon>
                    </Tooltip>
                  )
                ) : undefined
              }
            />
          </section>
        </aside>
      </div>

      <footer className={dialog.footer}>
        {task ? (
          <>
            <span className={dialog.footerNote}>{readOnly ? "View only" : "Saved automatically"}</span>
            <Button onClick={onClose}>Done</Button>
          </>
        ) : (
          <>
            <span className={dialog.footerNote}>Fill in what you know. Everything can be changed later.</span>
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button loading={creating} disabled={!form.title.trim()} onClick={() => void create()}>
              Create task
            </Button>
          </>
        )}
      </footer>
    </Modal>
  );
}
