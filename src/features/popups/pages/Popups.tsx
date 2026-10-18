import { useMemo } from "react";
import { Button, Skeleton } from "@mantine/core";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { RefreshButton } from "@/shared/ui/Refresh";
import { ErrorState } from "@/shared/ui/ErrorState";
import { useTitle } from "@/shared/lib/useTitle";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { useSites } from "@/features/workspace";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { QuantalogAppGate } from "@/features/integrations/components/quantalogApps/QuantalogAppGate";
import { useFeatureAllowance } from "@/features/billing/hooks/useFeatureAllowance";
import { usePopups } from "@/features/popups/hooks/usePopups";
import { usePopupActions } from "@/features/popups/hooks/usePopupActions";
import { PopupCard } from "@/features/popups/components/PopupCard";
import { PopupsOverview } from "@/features/popups/components/PopupsOverview";
import { PopupsEmpty } from "@/features/popups/components/PopupsEmpty";
import classes from "@/features/popups/components/Popups.module.css";

export default function Popups() {
  useTitle("Popups");
  const navigate = useNavigate();
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { popups: popupsOn } = useWorkspaceApps();
  const workspaceId = active?._id;
  const { popups, statsDays, loading, failed, refresh, refreshing, lastUpdated } = usePopups(popupsOn ? workspaceId : undefined);
  const { sites } = useSites(workspaceId);
  const actions = usePopupActions(workspaceId);
  const allowance = useFeatureAllowance("popups", popups.length);
  const siteNames = useMemo(() => new Map(sites.map((s) => [s.siteId, s.name])), [sites]);
  const hasPopups = popupsOn && popups.length > 0;
  const openNew = () => allowance.guard(() => navigate("/app/popups/new"));

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
        <>
          <Skeleton height={86} radius="lg" mb={26} />
          <div className={classes.grid}>
            <Skeleton height={380} radius="lg" />
            <Skeleton height={380} radius="lg" />
            <Skeleton height={380} radius="lg" />
          </div>
        </>
      ) : failed ? (
        <ErrorState onRetry={() => void refresh()} retrying={refreshing} />
      ) : !hasPopups ? (
        <PopupsEmpty canEdit={canEdit} hasSites={sites.length > 0} onCreate={openNew} />
      ) : (
        <>
          <PopupsOverview popups={popups} statsDays={statsDays} />
          <div className={classes.sectionHead}>
            <h3 className={classes.sectionTitle}>Your popups</h3>
            <span className={classes.sectionMeta}>
              {allowance.usage ? `${allowance.usage} on the ${allowance.plan} plan` : `${popups.length} total`}
            </span>
          </div>
          <div className={classes.grid}>
            {popups.map((popup) => (
              <PopupCard
                key={popup.id}
                popup={popup}
                siteName={siteNames.get(popup.siteId) ?? "Removed site"}
                canEdit={canEdit}
                busy={actions.busyId === popup.id}
                onToggle={(enabled) => void actions.toggle(popup, enabled)}
                onDuplicate={() => allowance.guard(() => void actions.duplicate(popup))}
                onDelete={() => actions.askDelete(popup)}
              />
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
