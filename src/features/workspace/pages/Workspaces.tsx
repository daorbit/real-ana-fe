import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mantine/core";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FolderKanban, Plus } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { useSites } from "@/features/workspace";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { useDemo } from "@/features/demo/context";
import { AddSiteWizard } from "@/features/workspace/components/AddSiteWizard";
import { useWorkspaceActions } from "@/features/workspace/hooks/useWorkspaceActions";
import { useWorkspacesDeepLink } from "@/features/workspace/hooks/useWorkspacesDeepLink";
import { WorkspaceSwitcher } from "@/features/workspace/components/workspaces/WorkspaceSwitcher";
import { WorkspaceMeta } from "@/features/workspace/components/workspaces/WorkspaceMeta";
import { WorkspaceActions } from "@/features/workspace/components/workspaces/WorkspaceActions";
import { WorkspaceDetails } from "@/features/workspace/components/workspaces/WorkspaceDetails";
import { OtherWorkspaces } from "@/features/workspace/components/workspaces/OtherWorkspaces";
import { SitesPanel } from "@/features/workspace/components/workspaces/SitesPanel";
import classes from "@/features/workspace/components/workspaces/Workspaces.module.css";
import { hasSiteSlot } from "@/features/workspace/siteLimit";
import { notify } from "@/shared/lib/notify";
import { WorkspacesSkeleton } from "@/shared/ui/Skeletons";
import { EmptyState } from "@/shared/ui/EmptyState";
import { PageHeader } from "@/shared/ui/Page";
import { PageHelpButton } from "@/shared/ui/PageHelpButton";
import { useTitle } from "@/shared/lib/useTitle";

const NEW_WORKSPACE_PATH = "/app/onboarding?mode=workspace";

export default function Workspaces() {
  useTitle("Workspaces");
  const { t } = useTranslation();
  const nav = useNavigate();
  const { workspaces, active, setActive, loading } = useWorkspace();
  const { demo } = useDemo();
  const perms = usePermissions();
  const canEdit = perms.canEdit && !demo;
  const canAdmin = perms.canAdmin && !demo;
  const canDelete = perms.canDelete && !demo;
  const [siteOpen, setSiteOpen] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const { sites, refresh, refreshing, lastUpdated } = useSites(active?._id);
  const actions = useWorkspaceActions(active ?? null, sites.length);

  const createWorkspace = () => nav(NEW_WORKSPACE_PATH);
  const selectFromCards = (id: string) => {
    setActive(id);
    topRef.current?.scrollIntoView({ block: "start" });
  };
  const openAddSite = () => {
    if (!hasSiteSlot(active?.billing, sites.length)) {
      notify.info(t("workspaces.oneSiteToast"));
      return;
    }
    setSiteOpen(true);
  };
  const focusedSiteId = useWorkspacesDeepLink(!loading && Boolean(active), canEdit, openAddSite);

  if (loading) return <AppShell><WorkspacesSkeleton /></AppShell>;

  if (!active) {
    return (
      <AppShell>
        <PageHeader
          title={t("workspaces.title")}
          description={t("workspaces.description")}
          actions={
            <>
              <Button
                variant="default"
                radius="xl"
                leftSection={<Plus size={16} />}
                onClick={createWorkspace}
                disabled={demo}
              >
                {t("workspaces.newWorkspace")}
              </Button>
              <PageHelpButton />
            </>
          }
        />
        <EmptyState
          icon={FolderKanban}
          title={t("workspaces.emptyTitle")}
          description={t("workspaces.emptyBody")}
          action={{ label: t("workspaces.emptyCta"), icon: Plus, onClick: createWorkspace }}
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div ref={topRef} />
      <PageHeader
        title={
          <WorkspaceSwitcher
            workspaces={workspaces}
            active={active}
            onSelect={setActive}
            onCreate={demo ? undefined : createWorkspace}
          />
        }
        description={<WorkspaceMeta workspace={active} />}
        actions={
          <>
            <WorkspaceActions
              workspace={active}
              canAdmin={canAdmin}
              canDelete={canDelete}
              validateName={actions.validateName}
              onRename={actions.rename}
              renaming={actions.renaming}
              onDelete={() => actions.removeWorkspace(active)}
            />
            <PageHelpButton />
          </>
        }
      />

      <AddSiteWizard
        opened={siteOpen}
        onClose={() => setSiteOpen(false)}
        workspaceId={active._id}
        existingDomains={sites.map((s) => s.domain.toLowerCase())}
      />

      <motion.div
        key={active._id}
        className={classes.main}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
      >
        <SitesPanel
          sites={sites}
          workspaceId={active._id}
          canEdit={canEdit}
          onAddSite={openAddSite}
          onDeleteSite={actions.removeSite}
          onRefresh={refresh}
          refreshing={refreshing}
          lastUpdated={lastUpdated}
          focusedSiteId={focusedSiteId}
        />
        <WorkspaceDetails workspace={active} canEdit={canEdit} canAdmin={canAdmin} />
        <OtherWorkspaces
          workspaces={workspaces}
          activeId={active._id}
          onSelect={selectFromCards}
          onCreate={demo ? undefined : createWorkspace}
        />
      </motion.div>
    </AppShell>
  );
}
