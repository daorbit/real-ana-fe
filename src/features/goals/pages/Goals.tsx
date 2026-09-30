import { Button } from "@mantine/core";
import { Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { RefreshButton } from "@/shared/ui/Refresh";
import { useTitle } from "@/shared/lib/useTitle";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { useTargets } from "@/features/goals/hooks/useTargets";
import { useTargetEditor } from "@/features/goals/hooks/useTargetEditor";
import { TargetCard } from "@/features/goals/components/TargetCard";
import { TargetFormModal } from "@/features/goals/components/TargetFormModal";
import { GoalsHero } from "@/features/goals/components/GoalsHero";
import { GoalsEmpty } from "@/features/goals/components/GoalsEmpty";
import { GoalsSkeleton } from "@/features/goals/components/GoalsSkeleton";
import classes from "@/features/goals/components/Goals.module.css";

export default function Goals() {
  useTitle("Goals");
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const workspaceId = active?._id;
  const { targets, loading, refresh, refreshing, lastUpdated } = useTargets(workspaceId);
  const editor = useTargetEditor(workspaceId);
  const hasTargets = targets.length > 0;

  return (
    <AppShell>
      <PageHeader
        title="Goals"
        description="Monthly and quarterly targets that track themselves."
        actions={
          hasTargets ? (
            <>
              <RefreshButton onRefresh={refresh} refreshing={refreshing} lastUpdated={lastUpdated} />
              {canEdit && (
                <Button color="emerald" leftSection={<Plus size={15} />} onClick={() => editor.openNew()}>
                  New goal
                </Button>
              )}
            </>
          ) : undefined
        }
      />

      {loading ? (
        <GoalsSkeleton />
      ) : !hasTargets ? (
        <GoalsEmpty canEdit={canEdit} onCreate={(preset) => editor.openNew(preset ?? null)} />
      ) : (
        <>
          <GoalsHero targets={targets} />
          <div className={classes.sectionHead}>
            <h3 className={classes.sectionTitle}>All goals</h3>
            <span className={classes.sectionMeta}>Refreshes every minute</span>
          </div>
          <div className={classes.grid}>
            <AnimatePresence>
              {targets.map((t, i) => (
                <TargetCard
                  key={t.id}
                  target={t}
                  index={i}
                  canEdit={canEdit}
                  deleting={editor.deletingId === t.id}
                  onEdit={() => editor.openEdit(t)}
                  onDelete={() => editor.askDelete(t)}
                />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {workspaceId && (
        <TargetFormModal
          opened={editor.editing !== null}
          workspaceId={workspaceId}
          initial={editor.editing?.initial ?? null}
          editing={Boolean(editor.editing?.id)}
          saving={editor.saving}
          onClose={editor.close}
          onSubmit={editor.submit}
        />
      )}
    </AppShell>
  );
}
