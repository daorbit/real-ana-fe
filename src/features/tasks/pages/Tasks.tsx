import { useMemo, useState } from "react";
import { Button, Skeleton } from "@mantine/core";
import { Plus } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { useTitle } from "@/shared/lib/useTitle";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { usePermissions, useWorkspace } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { useDemo } from "@/features/demo/context";
import { demoTasks } from "@/features/demo/demoTasks";
import { QuantalogAppGate } from "@/features/integrations/components/quantalogApps/QuantalogAppGate";
import { useGetTasksQuery } from "../api";
import { useTaskActions } from "../hooks/useTaskActions";
import { useTaskMembers } from "../hooks/useTaskMembers";
import type { TaskForm } from "../hooks/useTaskEditor";
import { filterTasks, groupTasks, topOf } from "../lib/board";
import { knownLabels } from "../lib/labels";
import { TasksToolbar } from "../components/TasksToolbar";
import { TaskBoard } from "../components/TaskBoard";
import { TaskGrid } from "../components/TaskGrid";
import { TaskDialog } from "../components/TaskDialog";
import type { BoardView, GroupBy, Task, TaskPatch } from "../types";
import classes from "../components/Tasks.module.css";

const NO_TASKS: Task[] = [];
const NO_DEFAULTS: Partial<TaskForm> = {};

export default function Tasks() {
  useTitle("Tasks");
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { tasks: on } = useWorkspaceApps();
  const { demo } = useDemo();
  const workspaceId = active?._id ?? "";

  const { currentData, isLoading } = useGetTasksQuery(workspaceId, { skip: !workspaceId || !on || demo });
  const tasks = demo ? demoTasks : currentData ?? NO_TASKS;
  const { members, byId } = useTaskMembers(workspaceId, demo, on);
  const actions = useTaskActions(workspaceId, tasks, demo);

  const [query, setQuery] = useState("");
  const [people, setPeople] = useState<Set<string>>(() => new Set());
  const [groupBy, setGroupBy] = useState<GroupBy>("progress");
  const [view, setView] = useState<BoardView>("board");
  const [dialog, setDialog] = useState<{ open: boolean; id: string | null; defaults: Partial<TaskForm> }>({
    open: false,
    id: null,
    defaults: NO_DEFAULTS,
  });

  const visible = useMemo(() => filterTasks(tasks, query, people), [tasks, query, people]);
  const labels = useMemo(() => knownLabels(tasks), [tasks]);
  const current = dialog.id ? tasks.find((t) => t.id === dialog.id) ?? null : null;

  const togglePerson = (id: string) =>
    setPeople((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const topOfStatus = (status: Task["status"]) => topOf(groupTasks(tasks, "progress").get(status) ?? NO_TASKS);

  const withOrder = (task: Task, patch: TaskPatch): TaskPatch =>
    patch.status && patch.status !== task.status && patch.order === undefined
      ? { ...patch, order: topOfStatus(patch.status) }
      : patch;

  const toggleDone = (task: Task) =>
    void actions.update(task.id, withOrder(task, { status: task.status === "done" ? "todo" : "done" }));

  return (
    <AppShell>
      <PageHeader
        title="Tasks"
        description="Plan the team's work on one board: who does what, by when."
        docsPath={DOCS_SLUGS.quantalogTasks}
        actions={
          on && canEdit ? (
            <Button leftSection={<Plus size={15} />} onClick={() => setDialog({ open: true, id: null, defaults: NO_DEFAULTS })}>
              Add task
            </Button>
          ) : undefined
        }
      />

      {!active ? null : !on ? (
        <QuantalogAppGate app="tasks" />
      ) : isLoading && !demo ? (
        <div className={classes.board}>
          <Skeleton height={420} width={300} radius="lg" />
          <Skeleton height={420} width={300} radius="lg" />
          <Skeleton height={420} width={300} radius="lg" />
        </div>
      ) : (
        <>
          <TasksToolbar
            query={query}
            onQuery={setQuery}
            members={members}
            people={people}
            onTogglePerson={togglePerson}
            groupBy={groupBy}
            onGroupBy={setGroupBy}
            view={view}
            onView={setView}
            usage={actions.usage}
          />
          {view === "board" ? (
            <TaskBoard
              tasks={visible}
              allTasks={tasks}
              groupBy={groupBy}
              members={members}
              memberMap={byId}
              canEdit={canEdit}
              creating={actions.creating}
              onCreate={(title, patch) => actions.create({ ...patch, title })}
              onOpen={(task) => setDialog({ open: true, id: task.id, defaults: NO_DEFAULTS })}
              onMove={(task, patch) => void actions.update(task.id, patch)}
              onToggleDone={toggleDone}
            />
          ) : (
            <TaskGrid
              tasks={visible}
              members={byId}
              canEdit={canEdit}
              onOpen={(task) => setDialog({ open: true, id: task.id, defaults: NO_DEFAULTS })}
              onToggleDone={toggleDone}
            />
          )}
        </>
      )}

      <TaskDialog
        opened={dialog.open}
        task={current}
        defaults={dialog.defaults}
        members={members}
        memberMap={byId}
        knownLabels={labels}
        canEdit={canEdit}
        creating={actions.creating}
        onClose={() => setDialog((d) => ({ ...d, open: false }))}
        onCreate={(patch) => actions.create({ ...patch, order: topOfStatus(patch.status ?? "todo") })}
        onUpdate={(patch) => current && void actions.update(current.id, withOrder(current, patch))}
        onDelete={(task) => actions.remove(task, () => setDialog((d) => ({ ...d, open: false })))}
      />
    </AppShell>
  );
}
