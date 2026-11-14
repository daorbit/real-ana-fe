import { Button } from "@mantine/core";
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
import { useBioPages } from "@/features/bio/hooks/useBioPages";
import { useBioActions } from "@/features/bio/hooks/useBioActions";
import { useBioAllowances } from "@/features/bio/hooks/useBioAllowances";
import { BioPageSection } from "@/features/bio/components/BioPageSection";
import { BioEmpty } from "@/features/bio/components/BioEmpty";
import { QrDialog } from "@/features/bio/components/QrDialog";
import { BioPagesSkeleton } from "@/features/bio/components/skeletons/BioPagesSkeleton";
import classes from "@/features/bio/components/BioPages.module.css";

function sectionMeta(statsDays: number, usage: string | null, plan: string): string {
  return `Last ${statsDays} days${usage ? ` · ${usage} on the ${plan} plan` : ""}`;
}

export default function BioPages() {
  useTitle("Link-in-bio");
  const navigate = useNavigate();
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { bio: bioOn } = useWorkspaceApps();
  const workspaceId = active?._id;
  const { pages, statsDays, loading, failed, refresh, refreshing, lastUpdated } = useBioPages(bioOn ? workspaceId : undefined);
  const actions = useBioActions(workspaceId);
  const allowances = useBioAllowances(pages);
  const hasPages = bioOn && pages.length > 0;
  const profiles = pages.filter((p) => p.kind !== "release");
  const releases = pages.filter((p) => p.kind === "release");
  const openNew = () => navigate("/app/bio/new");

  return (
    <AppShell>
      <PageHeader
        title="Link-in-bio"
        description="Bio pages and smart links at short addresses, with every tap counted."
        docsPath={DOCS_SLUGS.quantalogBio}
        actions={
          hasPages ? (
            <>
              <RefreshButton onRefresh={refresh} refreshing={refreshing} lastUpdated={lastUpdated} />
              {canEdit && (
                <Button leftSection={<Plus size={15} />} onClick={openNew}>
                  New
                </Button>
              )}
            </>
          ) : undefined
        }
      />

      {!bioOn ? (
        <QuantalogAppGate app="bio" />
      ) : loading ? (
        <BioPagesSkeleton />
      ) : failed ? (
        <ErrorState onRetry={() => void refresh()} retrying={refreshing} />
      ) : !hasPages ? (
        <BioEmpty canEdit={canEdit} onCreate={openNew} />
      ) : (
        <div className={classes.sections}>
          <BioPageSection
            title="Smart links"
            meta={sectionMeta(statsDays, allowances.release.usage, allowances.release.plan)}
            pages={releases}
            canEdit={canEdit}
            actions={actions}
          />
          <BioPageSection
            title="Bio pages"
            meta={sectionMeta(statsDays, allowances.profile.usage, allowances.profile.plan)}
            pages={profiles}
            canEdit={canEdit}
            actions={actions}
          />
        </div>
      )}

      <QrDialog page={actions.qrPage} onClose={actions.closeQr} />
    </AppShell>
  );
}
