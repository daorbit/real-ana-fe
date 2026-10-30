import type { ReactNode } from "react";
import { ActionIcon, Button, Menu, Modal, Select, TextInput, Textarea } from "@mantine/core";
import { Link } from "react-router-dom";
import { CalendarDays, Columns3, ExternalLink, Flag, MoreHorizontal, Tag, Trash2, UserPlus, X } from "lucide-react";
import { timeAgo } from "@/shared/lib/format";
import type { WorkspaceMember } from "@/shared/types";
import { PRIORITY_LABEL, PRIORITY_ORDER, STATUS_LABEL, STATUS_ORDER, taskKey } from "../lib/board";
import { toPatch, useTaskEditor, type TaskForm } from "../hooks/useTaskEditor";
import type { Bucket, Task, TaskLabel, TaskPatch, TaskPriority, TaskStatus } from "../types";
import { AssigneePicker } from "./AssigneePicker";
import { ChecklistEditor } from "./ChecklistEditor";
import { LabelEditor } from "./LabelEditor";
import { ProgressButton, ProgressGlyph } from "./TaskBits";
import classes from "./Tasks.module.css";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={classes.prop}>
      <span className={classes.propLabel}>{label}</span>
      {children}
    </div>
  );
}

function IconRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className={classes.iconRow}>
      <span className={classes.iconRowIcon}>{icon}</span>
      <div className={classes.iconRowBody}>{children}</div>
    </div>
  );
}

export function TaskDialog({
  opened,
  task,
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
  onDelete,
}: {
  opened: boolean;
  task: Task | null;
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
  onDelete: (task: Task) => void;
}) {
  const { form, change, type, commit } = useTaskEditor(task, opened, { bucketId: buckets[0]?.id ?? null, ...defaults }, onUpdate);
  const readOnly = !canEdit;
  const author = task?.createdBy ? memberMap.get(task.createdBy) : undefined;

  const create = async () => {
    const ok = await onCreate({ ...toPatch(form), title: form.title.trim(), link: form.link.trim() });
    if (ok) onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={720}
      withCloseButton={false}
      padding={0}
      radius="lg"
      classNames={{ content: classes.dialogContent }}
    >
      <header className={classes.dialogHeader}>
        <span className={classes.planName}>{planName}</span>
        {task && <span className={classes.crumbKey}>{taskKey(task.key)}</span>}
        <span className={classes.dialogTopEnd}>
          {task && canEdit && (
            <Menu position="bottom-end" width={180}>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray" aria-label="More actions">
                  <MoreHorizontal size={18} />
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
            <X size={18} />
          </ActionIcon>
        </span>
      </header>

      <div className={classes.dialogBody}>
        <div className={classes.titleBlock}>
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
          {task && (
            <span className={classes.lastChanged}>
              Last changed {timeAgo(task.updatedAt)}
              {author ? ` · created by ${author.name || author.email}` : ""}
            </span>
          )}
        </div>

        <div className={classes.iconRows}>
          <IconRow icon={<Tag size={17} />}>
            <LabelEditor value={form.labels} known={knownLabels} readOnly={readOnly} onChange={(labels) => change({ labels })} />
          </IconRow>
          <IconRow icon={<UserPlus size={17} />}>
            <AssigneePicker
              value={form.assigneeId}
              members={members}
              memberMap={memberMap}
              readOnly={readOnly}
              onChange={(assigneeId) => change({ assigneeId })}
            />
          </IconRow>
        </div>

        <div className={classes.fields}>
          <Field label="Progress">
            <Select
              allowDeselect={false}
              readOnly={readOnly}
              leftSection={
                <span className={classes.progress} data-status={form.status}>
                  <ProgressGlyph status={form.status} size={15} />
                </span>
              }
              value={form.status}
              onChange={(v) => v && change({ status: v as TaskStatus })}
              data={STATUS_ORDER.map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
            />
          </Field>
          <Field label="Priority">
            <Select
              allowDeselect={false}
              readOnly={readOnly}
              leftSection={<Flag size={15} />}
              value={form.priority}
              onChange={(v) => v && change({ priority: v as TaskPriority })}
              data={PRIORITY_ORDER.map((p) => ({ value: p, label: PRIORITY_LABEL[p] }))}
            />
          </Field>
          <Field label="Due date">
            <TextInput
              type="date"
              readOnly={readOnly}
              leftSection={<CalendarDays size={15} />}
              value={form.due}
              onChange={(e) => change({ due: e.currentTarget.value })}
            />
          </Field>
          <Field label="Bucket">
            <Select
              allowDeselect={false}
              readOnly={readOnly}
              leftSection={<Columns3 size={15} />}
              value={form.bucketId}
              onChange={(v) => v && change({ bucketId: v })}
              data={buckets.map((b) => ({ value: b.id, label: b.name }))}
            />
          </Field>
        </div>

        <ChecklistEditor
          items={form.checklist}
          onCard={form.checklistOnCard}
          readOnly={readOnly}
          onChange={(checklist) => change({ checklist })}
          onCardChange={(checklistOnCard) => change({ checklistOnCard })}
        />

        <section className={classes.section}>
          <span className={classes.sectionTitle}>Notes</span>
          <Textarea
            autosize
            minRows={4}
            maxRows={14}
            maxLength={4000}
            placeholder="Type a description or add notes here"
            readOnly={readOnly}
            value={form.notes}
            onChange={(e) => type("notes", e.currentTarget.value)}
            onBlur={() => commit("notes")}
          />
        </section>

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
      </div>

      {!task && (
        <footer className={classes.dialogFooter}>
          <span>Fill in what you know. Everything can be changed later.</span>
          <Button loading={creating} disabled={!form.title.trim()} onClick={() => void create()}>
            Add task
          </Button>
        </footer>
      )}
    </Modal>
  );
}
