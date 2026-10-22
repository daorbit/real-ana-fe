import { Button, Skeleton } from "@mantine/core";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { RefreshButton } from "@/shared/ui/Refresh";
import { ErrorState } from "@/shared/ui/ErrorState";
import { useTitle } from "@/shared/lib/useTitle";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { QuantalogAppGate } from "@/features/integrations/components/quantalogApps/QuantalogAppGate";
import { useFeatureAllowance } from "@/features/billing/hooks/useFeatureAllowance";
import { useBioPages } from "@/features/bio/hooks/useBioPages";
import { useBioActions } from "@/features/bio/hooks/useBioActions";
import { BioPageCard } from "@/features/bio/components/BioPageCard";
import { BioEmpty } from "@/features/bio/components/BioEmpty";
import classes from "@/features/bio/components/BioPages.module.css";

export default function BioPages() {
  useTitle("Link in bio");
  const navigate = useNavigate();
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { bio: bioOn } = useWorkspaceApps();
  const workspaceId = active?._id;
  const { pages, statsDays, loading, failed, refresh, refreshing, lastUpdated } = useBioPages(bioOn ? workspaceId : undefined);
  const actions = useBioActions(workspaceId);
  const allowance = useFeatureAllowance("bioPages", pages.length);
  const hasPages = bioOn && pages.length > 0;
  const openNew = () => allowance.guard(() => navigate("/app/bio/new"));

  return (
    <AppShell>
      <PageHeader
        title="Link in bio"
        description="One link for your social bios, with every tap counted."
        docsPath={DOCS_SLUGS.quantalogBio}
        actions={
          hasPages ? (
            <>
              <RefreshButton onRefresh={refresh} refreshing={refreshing} lastUpdated={lastUpdated} />
              {canEdit && (
                <Button leftSection={<Plus size={15} />} onClick={openNew}>
                  New page
                </Button>
              )}
            </>
          ) : undefined
        }
      />

      {!bioOn ? (
        <QuantalogAppGate app="bio" />
      ) : loading ? (
        <div className={classes.grid}>
          <Skeleton height={210} radius="lg" />
          <Skeleton height={210} radius="lg" />
        </div>
      ) : failed ? (
        <ErrorState onRetry={() => void refresh()} retrying={refreshing} />
      ) : !hasPages ? (
        <BioEmpty canEdit={canEdit} onCreate={openNew} />
      ) : (
        <>
          <div className={classes.sectionHead}>
            <h3 className={classes.sectionTitle}>Your pages</h3>
            <span className={classes.sectionMeta}>
              Last {statsDays} days
              {allowance.usage ? ` · ${allowance.usage} on the ${allowance.plan} plan` : ""}
            </span>
          </div>
          <div className={classes.grid}>
            {pages.map((page) => (
              <BioPageCard
                key={page.id}
                page={page}
                canEdit={canEdit}
                busy={actions.busyId === page.id}
                onTogglePublished={(published) => void actions.togglePublished(page, published)}
                onCopy={() => void actions.copyLink(page)}
                onDelete={() => actions.askDelete(page)}
              />
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
