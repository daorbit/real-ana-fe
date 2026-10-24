import { useMemo } from "react";
import { Button, Skeleton } from "@mantine/core";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { useGetFunnelOverviewQuery } from "@/app/store";
import { PageHeader } from "@/shared/ui/Page";
import { useTitle } from "@/shared/lib/useTitle";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { usePermissions, useWorkspace } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { QuantalogAppGate } from "@/features/integrations/components/quantalogApps/QuantalogAppGate";
import { useFunnelRange, withSearch } from "../hooks/useFunnelRange";
import { useFunnelSites } from "../hooks/useFunnelSites";
import { useFunnelSourceStats } from "../hooks/useFunnelSourceStats";
import { useSavedFunnels } from "../hooks/useSavedFunnels";
import { funnelPresets } from "../lib/funnelPresets";
import { FunnelList } from "../components/FunnelList";
import { FunnelRangeControls } from "../components/FunnelRangeControls";
import { FunnelsEmpty } from "../components/FunnelsEmpty";
import classes from "../components/Funnels.module.css";

const OVERVIEW_LIMIT = 20;

export default function Funnels() {
  useTitle("Funnels");
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { funnels: on } = useWorkspaceApps();
  const workspaceId = active?._id;
  const { range, setRange, compare, setCompare, search } = useFunnelRange();
  const sites = useFunnelSites(workspaceId);
  const { saved, loading } = useSavedFunnels(workspaceId, on);
  const empty = !loading && saved.length === 0;

  const { currentData: rows, isFetching } = useGetFunnelOverviewQuery(
    { workspaceId: workspaceId!, range: range.preset, from: range.from, to: range.to, sites, compare },
    { skip: !workspaceId || !on || saved.length === 0 },
  );
  const overview = useMemo(() => new Map((rows ?? []).map((row) => [row.id, row])), [rows]);

  const { stats } = useFunnelSourceStats(workspaceId, range, sites, on && empty && canEdit);
  const presets = useMemo(() => funnelPresets(stats), [stats]);

  return (
    <AppShell>
      <PageHeader
        title="Funnels"
        description="Follow visitors through the steps that lead to a signup or a sale, and see where they leave."
        docsPath={DOCS_SLUGS.funnels}
        actions={
          on && !empty ? (
            <>
              <FunnelRangeControls range={range} onRangeChange={setRange} compare={compare} onCompareChange={setCompare} />
              {canEdit && (
                <Button component={Link} to={withSearch("/app/funnels/new", search)} leftSection={<Plus size={15} />}>
                  New funnel
                </Button>
              )}
            </>
          ) : undefined
        }
      />

      {!active ? null : !on ? (
        <QuantalogAppGate app="funnels" />
      ) : loading ? (
        <div className={classes.listSkeleton}>
          <Skeleton height={76} radius="lg" />
          <Skeleton height={76} radius="lg" />
          <Skeleton height={76} radius="lg" />
        </div>
      ) : empty ? (
        <FunnelsEmpty presets={presets} canEdit={canEdit} />
      ) : (
        <>
          <FunnelList funnels={saved} overview={overview} loadingOverview={isFetching && !rows} search={search} />
          {saved.length > OVERVIEW_LIMIT && (
            <p className={classes.listNote}>Conversion is shown for the {OVERVIEW_LIMIT} most recently edited funnels.</p>
          )}
        </>
      )}
    </AppShell>
  );
}
