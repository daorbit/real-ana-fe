import { ActionIcon, Button, Menu, Modal, Select, TextInput, Textarea } from "@mantine/core";
import { Link } from "react-router-dom";
import { ExternalLink, MoreHorizontal, Trash2, X } from "lucide-react";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { timeAgo } from "@/shared/lib/format";
import type { WorkspaceMember } from "@/shared/types";
import { PRIORITY_LABEL, PRIORITY_ORDER, STATUS_LABEL, STATUS_ORDER, taskKey } from "../lib/board";
import { toPatch, useTaskEditor, type TaskForm } from "../hooks/useTaskEditor";
import type { Task, TaskLabel, TaskPatch, TaskPriority, TaskStatus } from "../types";
import { ChecklistEditor } from "./ChecklistEditor";
import { LabelEditor } from "./LabelEditor";
import { ProgressButton } from "./TaskBits";
import classes from "./Tasks.module.css";

export function TaskDialog({
  opened,
  task,
  defaults,
  members,
  memberMap,
  knownLabels,
  canEdit,
  creating,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: {
  opened: boolean;
  task: Task | null;
  defaults: Partial<TaskForm>;
  members: WorkspaceMember[];
  memberMap: Map<string, WorkspaceMember>;
  knownLabels: TaskLabel[];
  canEdit: boolean;
  creating: boolean;
  onClose: () => void;
  onCreate: (patch: TaskPatch & { title: string }) => Promise<boolean>;
  onUpdate: (patch: TaskPatch) => void;
  onDelete: (task: Task) => void;
}) {
  const { form, change, type, commit } = useTaskEditor(task, opened, defaults, onUpdate);
  const readOnly = !canEdit;
  const assignee = form.assigneeId ? memberMap.get(form.assigneeId) : undefined;
  const author = task?.createdBy ? memberMap.get(task.createdBy) : undefined;

  const create = async () => {
    const ok = await onCreate({ ...toPatch(form), title: form.title.trim(), link: form.link.trim() });
    if (ok) onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} size={720} withCloseButton={false} padding="lg" radius="xl">
      <div className={classes.dialog}>
        <div className={classes.dialogTop}>
          <span>{task ? taskKey(task.key) : "New task"}</span>
          <span>·</span>
          <span>Quantalog Tasks</span>
          <span className={classes.dialogTopEnd}>
            {task && canEdit && (
              <Menu position="bottom-end" width={180}>
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray" aria-label="More actions">
                    <MoreHorizontal size={17} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item className="danger-item" leftSection={<Trash2 size={14} />} onClick={() => onDelete(task)}>
                    Delete task
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
            <ActionIcon variant="subtle" color="gray" onClick={onClose} aria-label="Close">
              <X size={17} />
            </ActionIcon>
          </span>
        </div>

        <div className={classes.dialogTitleRow}>
          <span className={classes.dialogProgress}>
            <ProgressButton
              status={form.status}
              size={22}
              disabled={readOnly}
              onToggle={() => change({ status: form.status === "done" ? "todo" : "done" })}
            />
          </span>
          <Textarea
            className={classes.titleInput}
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

        <LabelEditor value={form.labels} known={knownLabels} readOnly={readOnly} onChange={(labels) => change({ labels })} />

        <div className={classes.assignRow}>
          <span className={classes.assignLabel}>Assigned to</span>
          <Select
            flex={1}
            placeholder="Assign"
            clearable
            searchable
            readOnly={readOnly}
            value={form.assigneeId}
            onChange={(v) => change({ assigneeId: v })}
            leftSection={assignee ? <UserAvatar src={assignee.avatarUrl} name={assignee.name} size={20} radius="xl" /> : undefined}
            data={members.map((m) => ({ value: m.userId, label: m.name || m.email }))}
            renderOption={({ option }) => {
              const m = memberMap.get(option.value);
              return (
                <span className={classes.personCell}>
                  <UserAvatar src={m?.avatarUrl} name={option.label} size={22} radius="xl" />
                  {option.label}
                </span>
              );
            }}
          />
        </div>

        <div className={classes.fieldGrid}>
          <Select
            label="Progress"
            allowDeselect={false}
            readOnly={readOnly}
            value={form.status}
            onChange={(v) => v && change({ status: v as TaskStatus })}
            data={STATUS_ORDER.map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
          />
          <Select
            label="Priority"
            allowDeselect={false}
            readOnly={readOnly}
            value={form.priority}
            onChange={(v) => v && change({ priority: v as TaskPriority })}
            data={PRIORITY_ORDER.map((p) => ({ value: p, label: PRIORITY_LABEL[p] }))}
          />
          <TextInput
            label="Due date"
            type="date"
            readOnly={readOnly}
            value={form.due}
            onChange={(e) => change({ due: e.currentTarget.value })}
          />
        </div>

        <section className={classes.section}>
          <span className={classes.sectionTitle}>Notes</span>
          <Textarea
            autosize
            minRows={3}
            maxRows={12}
            maxLength={4000}
            placeholder="Add a description"
            readOnly={readOnly}
            value={form.notes}
            onChange={(e) => type("notes", e.currentTarget.value)}
            onBlur={() => commit("notes")}
          />
        </section>

        <ChecklistEditor
          items={form.checklist}
          onCard={form.checklistOnCard}
          readOnly={readOnly}
          onChange={(checklist) => change({ checklist })}
          onCardChange={(checklistOnCard) => change({ checklistOnCard })}
        />

        <section className={classes.section}>
          <span className={classes.sectionTitle}>Link</span>
          <TextInput
            placeholder="https://… or a Quantalog page like /app/seo"
            readOnly={readOnly}
            value={form.link}
            onChange={(e) => type("link", e.currentTarget.value)}
            onBlur={() => commit("link")}
            rightSection={
              task?.link ? (
                task.link.startsWith("/app/") ? (
                  <ActionIcon component={Link} to={task.link} variant="subtle" color="gray" aria-label="Open link">
                    <ExternalLink size={15} />
                  </ActionIcon>
                ) : (
                  <ActionIcon component="a" href={task.link} target="_blank" rel="noopener noreferrer" variant="subtle" color="gray" aria-label="Open link">
                    <ExternalLink size={15} />
                  </ActionIcon>
                )
              ) : undefined
            }
          />
        </section>

        <div className={classes.dialogFoot}>
          <span>
            {task
              ? `Created ${author ? `by ${author.name || author.email} ` : ""}${timeAgo(task.createdAt)} · updated ${timeAgo(task.updatedAt)}`
              : "Fill in what you know. Everything can be changed later."}
          </span>
          {task ? (
            canEdit && <span>Changes save automatically</span>
          ) : (
            <Button loading={creating} disabled={!form.title.trim()} onClick={() => void create()}>
              Add task
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
