import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button } from "@mantine/core";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FolderKanban, Plus } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { useSites } from "@/features/workspace";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { AddSiteWizard } from "@/features/workspace/components/AddSiteWizard";
import { useWorkspaceActions } from "@/features/workspace/hooks/useWorkspaceActions";
import { marksFor } from "@/features/workspace/workspaceMarks";
import { WorkspaceList } from "@/features/workspace/components/workspaces/WorkspaceList";
import { WorkspaceHero } from "@/features/workspace/components/workspaces/WorkspaceHero";
import { WorkspaceStats } from "@/features/workspace/components/workspaces/WorkspaceStats";
import { SitesPanel } from "@/features/workspace/components/workspaces/SitesPanel";
import classes from "@/features/workspace/components/workspaces/Workspaces.module.css";
import { trace } from "@/shared/lib/analytics";
import { useAuth } from "@/features/auth/context";
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
  const { user } = useAuth();
  const { workspaces, active, setActive, loading } = useWorkspace();
  const { canEdit, canAdmin, canDelete } = usePermissions();
  const [siteOpen, setSiteOpen] = useState(false);

  const { sites, refresh, refreshing, lastUpdated } = useSites(active?._id);
  const actions = useWorkspaceActions(active ?? null, sites.length);
  const marks = useMemo(() => marksFor(workspaces), [workspaces]);

  const createWorkspace = () => nav(NEW_WORKSPACE_PATH);
  const openAddSite = () => {
    trace(user?.id, "add_site_clicked", "workspaces", "add_site_wizard");
    setSiteOpen(true);
  };

  if (loading) return <AppShell><WorkspacesSkeleton /></AppShell>;

  return (
    <AppShell>
      <PageHeader
        title={t("workspaces.title")}
        description={t("workspaces.description")}
        actions={
          <>
            <Button variant="default" leftSection={<Plus size={16} />} onClick={createWorkspace}>
              {t("workspaces.newWorkspace")}
            </Button>
            <PageHelpButton />
          </>
        }
      />

      {active && (
        <AddSiteWizard
          opened={siteOpen}
          onClose={() => setSiteOpen(false)}
          workspaceId={active._id}
          existingDomains={sites.map((s) => s.domain.toLowerCase())}
        />
      )}

      {!active ? (
        <EmptyState
          icon={FolderKanban}
          title={t("workspaces.emptyTitle")}
          description={t("workspaces.emptyBody")}
          action={{ label: t("workspaces.emptyCta"), icon: Plus, onClick: createWorkspace }}
        />
      ) : (
        <Box className={classes.layout}>
          <WorkspaceList
            workspaces={workspaces}
            activeId={active._id}
            marks={marks}
            onSelect={setActive}
            onCreate={createWorkspace}
          />

          <motion.div
            key={active._id}
            className={classes.main}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            <WorkspaceHero
              workspace={active}
              mark={marks.get(active._id)}
              canEdit={canEdit}
              canAdmin={canAdmin}
              canDelete={canDelete}
              validateName={actions.validateName}
              onRename={actions.rename}
              renaming={actions.renaming}
              onAddSite={openAddSite}
              onDelete={() => actions.removeWorkspace(active)}
            />
            <WorkspaceStats workspace={active} siteCount={sites.length} />
            <SitesPanel
              sites={sites}
              workspaceId={active._id}
              canEdit={canEdit}
              onAddSite={openAddSite}
              onDeleteSite={actions.removeSite}
              onRefresh={refresh}
              refreshing={refreshing}
              lastUpdated={lastUpdated}
            />
          </motion.div>
        </Box>
      )}
    </AppShell>
  );
}
