import { useMemo } from "react";
import { Button, Skeleton } from "@mantine/core";
import { AppWindow, Plus } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { RefreshButton } from "@/shared/ui/Refresh";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { useTitle } from "@/shared/lib/useTitle";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { useSites } from "@/features/workspace";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { QuantalogAppGate } from "@/features/integrations/components/quantalogApps/QuantalogAppGate";
import { useFeatureAllowance } from "@/features/billing/hooks/useFeatureAllowance";
import { usePopups } from "@/features/popups/hooks/usePopups";
import { usePopupEditor } from "@/features/popups/hooks/usePopupEditor";
import { PopupCard } from "@/features/popups/components/PopupCard";
import { PopupFormModal } from "@/features/popups/components/PopupFormModal";
import classes from "@/features/popups/components/Popups.module.css";

export default function Popups() {
  useTitle("Popups");
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { popups: popupsOn } = useWorkspaceApps();
  const workspaceId = active?._id;
  const { popups, statsDays, loading, failed, refresh, refreshing, lastUpdated } = usePopups(popupsOn ? workspaceId : undefined);
  const { sites } = useSites(workspaceId);
  const editor = usePopupEditor(workspaceId);
  const allowance = useFeatureAllowance("popups", popups.length);
  const openNew = () => allowance.guard(editor.openNew);
  const siteNames = useMemo(() => new Map(sites.map((s) => [s.siteId, s.name])), [sites]);
  const hasPopups = popupsOn && popups.length > 0;

  return (
    <AppShell>
      <PageHeader
        title="Popups"
        description="Show your lead capture forms as popups on your website."
        docsPath={DOCS_SLUGS.quantalogPopups}
        actions={
          hasPopups ? (
            <>
              <RefreshButton onRefresh={refresh} refreshing={refreshing} lastUpdated={lastUpdated} />
              {canEdit && (
                <Button leftSection={<Plus size={15} />} onClick={openNew}>
                  New popup
                </Button>
              )}
            </>
          ) : undefined
        }
      />

      {!popupsOn ? (
        <QuantalogAppGate app="popups" />
      ) : loading ? (
        <div className={classes.grid}>
          <Skeleton height={240} radius="lg" />
          <Skeleton height={240} radius="lg" />
        </div>
      ) : failed ? (
        <ErrorState onRetry={() => void refresh()} retrying={refreshing} />
      ) : !hasPopups ? (
        <EmptyState
          icon={AppWindow}
          title="No popups yet"
          description="Pick a published form, choose when it should open, and it appears on your site through the tracking script you already installed."
          action={canEdit ? { label: "Create a popup", icon: Plus, onClick: openNew, disabled: sites.length === 0 } : undefined}
          actionNote={sites.length === 0 ? "Add a site first, then come back to create a popup." : undefined}
        />
      ) : (
        <>
          <div className={classes.sectionHead}>
            <h3 className={classes.sectionTitle}>Your popups</h3>
            <span className={classes.sectionMeta}>
              {allowance.usage ? `${allowance.usage} on the ${allowance.plan} plan · ` : ""}Stats from the last {statsDays} days
            </span>
          </div>
          <div className={classes.grid}>
            {popups.map((popup) => (
              <PopupCard
                key={popup.id}
                popup={popup}
                siteName={siteNames.get(popup.siteId) ?? "Removed site"}
                canEdit={canEdit}
                busy={editor.busyId === popup.id}
                onToggle={(enabled) => void editor.toggle(popup, enabled)}
                onEdit={() => editor.openEdit(popup)}
                onDelete={() => editor.askDelete(popup)}
              />
            ))}
          </div>
        </>
      )}

      {workspaceId && popupsOn && (
        <PopupFormModal
          opened={editor.editing !== null}
          workspaceId={workspaceId}
          initial={editor.editing?.initial ?? null}
          editing={Boolean(editor.editing?.id)}
          saving={editor.saving}
          onClose={editor.close}
          onSubmit={(input) => void editor.submit(input)}
        />
      )}
    </AppShell>
  );
}
