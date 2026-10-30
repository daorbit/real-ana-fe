import { useMemo, useState } from "react";
import { Button } from "@mantine/core";
import { ListTodo, Plus, SearchX } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useTitle } from "@/shared/lib/useTitle";
import { useBodyPage } from "@/shared/lib/useBodyPage";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { usePermissions, useWorkspace } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { useDemo } from "@/features/demo/context";
import { useAuth } from "@/features/auth/context";
import { demoBuckets, demoTasks } from "@/features/demo/demoTasks";
import { QuantalogAppGate } from "@/features/integrations/components/quantalogApps/QuantalogAppGate";
import { useGetTasksQuery } from "../api";
import { useTaskActions } from "../hooks/useTaskActions";
import { useTaskMembers } from "../hooks/useTaskMembers";
import { useBucketActions } from "../hooks/useBucketActions";
import { useTaskWorkflow } from "../hooks/useTaskWorkflow";
import { TaskIndexProvider } from "../hooks/TaskIndexContext";
import type { TaskForm } from "../hooks/useTaskEditor";
import { filterTasks } from "../lib/board";
import { knownLabels } from "../lib/labels";
import { TasksToolbar } from "../components/TasksToolbar";
import { TaskViews } from "../components/TaskViews";
import { TaskDialog } from "../components/TaskDialog";
import { TasksSkeleton } from "../components/TasksSkeleton";
import classes from "../components/Tasks.module.css";
import type { BoardView, Bucket, DueFilter, GroupBy, Task } from "../types";

const NO_TASKS: Task[] = [];
const NO_BUCKETS: Bucket[] = [];
const NO_DEFAULTS: Partial<TaskForm> = {};

export default function Tasks() {
  useTitle("Tasks");
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { user } = useAuth();
  const { tasks: on } = useWorkspaceApps();
  const { demo } = useDemo();
  const workspaceId = active?._id ?? "";

  const { currentData, isLoading } = useGetTasksQuery(workspaceId, { skip: !workspaceId || !on || demo });
  const tasks = demo ? demoTasks : currentData?.tasks ?? NO_TASKS;
  const buckets = demo ? demoBuckets : currentData?.buckets ?? NO_BUCKETS;
  const { members, byId } = useTaskMembers(workspaceId, demo, on);
  const actions = useTaskActions(workspaceId, tasks, demo);
  const bucketActions = useBucketActions(workspaceId, buckets, demo);
  const workflow = useTaskWorkflow(tasks, buckets, actions);

  const [query, setQuery] = useState("");
  const [people, setPeople] = useState<Set<string>>(() => new Set());
  const [myTasksOnly, setMyTasksOnly] = useState(false);
  const [dueFilter, setDueFilter] = useState<DueFilter>("all");
  const [groupBy, setGroupBy] = useState<GroupBy>("bucket");
  const [view, setView] = useState<BoardView>("board");
  const [dialog, setDialog] = useState<{ open: boolean; id: string | null; defaults: Partial<TaskForm> }>({
    open: false,
    id: null,
    defaults: NO_DEFAULTS,
  });

  const taskUserId = demo ? "demo-user-priya" : user?.id ?? null;
  const visible = useMemo(
    () => filterTasks(tasks, query, people, dueFilter, myTasksOnly, taskUserId),
    [tasks, query, people, dueFilter, myTasksOnly, taskUserId],
  );
  const labels = useMemo(() => knownLabels(tasks), [tasks]);
  const current = dialog.id ? tasks.find((t) => t.id === dialog.id) ?? null : null;

  const togglePerson = (id: string) =>
    setPeople((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const clearFilters = () => {
    setQuery("");
    setPeople(new Set());
    setMyTasksOnly(false);
    setDueFilter("all");
  };

  const filtersActive = Boolean(query.trim() || people.size || myTasksOnly || dueFilter !== "all");
  const openNew = () => setDialog({ open: true, id: null, defaults: NO_DEFAULTS });
  const openTask = (task: Task) => setDialog({ open: true, id: task.id, defaults: NO_DEFAULTS });
  const update = (task: Task, patch: Parameters<typeof workflow.update>[1]) => void workflow.update(task, patch);
  const showEmpty = visible.length === 0 && view !== "mine";

  useBodyPage("tasks-board", on && view === "board" && !showEmpty);

  return (
    <AppShell>
      <TaskIndexProvider tasks={tasks}>
        <div className={classes.page}>
          <PageHeader
            title="Tasks"
            description="Plan the team's work on one board: who does what, by when."
            docsPath={DOCS_SLUGS.quantalogTasks}
            actions={
              on && canEdit ? (
                <Button visibleFrom="sm" leftSection={<Plus size={15} />} onClick={openNew}>
                  Add task
                </Button>
              ) : undefined
            }
          />

          {!active ? null : !on ? (
            <QuantalogAppGate app="tasks" />
          ) : isLoading && !demo ? (
            <TasksSkeleton />
          ) : (
            <>
              <TasksToolbar
                query={query}
                onQuery={setQuery}
                members={members}
                people={people}
                onTogglePerson={togglePerson}
                onRemovePerson={(id) =>
                  setPeople((currentPeople) => {
                    const next = new Set(currentPeople);
                    next.delete(id);
                    return next;
                  })
                }
                onClearFilters={clearFilters}
                userId={taskUserId}
                myTasksOnly={myTasksOnly}
                onMyTasks={() => setMyTasksOnly((value) => !value)}
                dueFilter={dueFilter}
                onDueFilter={setDueFilter}
                groupBy={groupBy}
                onGroupBy={setGroupBy}
                view={view}
                onView={setView}
                usage={actions.usage}
                onAdd={canEdit ? openNew : undefined}
              />
              {showEmpty ? (
                <EmptyState
                  compact
                  minHeight="35vh"
                  icon={tasks.length ? SearchX : ListTodo}
                  title={tasks.length ? "No tasks match these filters" : "No tasks yet"}
                  description={
                    tasks.length
                      ? "Try changing your search or removing a filter to see more tasks."
                      : canEdit
                        ? "Add a task to start planning the team's work here."
                        : "Tasks added to this workspace will appear here."
                  }
                  action={
                    tasks.length && filtersActive
                      ? { label: "Clear filters", onClick: clearFilters }
                      : !tasks.length && canEdit
                        ? { label: "Add task", onClick: openNew, icon: Plus }
                        : undefined
                  }
                />
              ) : (
                <TaskViews
                  view={view}
                  visible={visible}
                  tasks={tasks}
                  buckets={buckets}
                  groupBy={groupBy}
                  members={members}
                  memberMap={byId}
                  userId={taskUserId}
                  canEdit={canEdit}
                  creating={actions.creating}
                  addingBucket={bucketActions.adding}
                  onOpen={openTask}
                  onCreate={(title, patch) => actions.create({ ...patch, title })}
                  onUpdate={update}
                  onToggleDone={workflow.toggleDone}
                  onAddBucket={bucketActions.add}
                  onRenameBucket={(bucket, name) => void bucketActions.rename(bucket, name)}
                  onSetBucketLimit={(bucket, limit) => void bucketActions.setLimit(bucket, limit)}
                  onDeleteBucket={bucketActions.remove}
                />
              )}
            </>
          )}
        </div>

        <TaskDialog
          opened={dialog.open}
          task={current}
          tasks={tasks}
          defaults={dialog.defaults}
          planName={active?.name ?? "Tasks"}
          buckets={buckets}
          members={members}
          memberMap={byId}
          knownLabels={labels}
          canEdit={canEdit}
          creating={actions.creating}
          onClose={() => setDialog((d) => ({ ...d, open: false }))}
          onCreate={workflow.create}
          onUpdate={(patch) => current && update(current, patch)}
          onUpdateOther={update}
          onToggleDone={workflow.toggleDone}
          onCreateSubtask={workflow.createSubtask}
          onOpenTask={openTask}
          onDelete={(task) => actions.remove(task, () => setDialog((d) => ({ ...d, open: false })))}
        />
      </TaskIndexProvider>
    </AppShell>
  );
}
