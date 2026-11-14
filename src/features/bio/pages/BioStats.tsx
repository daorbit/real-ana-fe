import { useMemo, useState } from "react";
import { Button } from "@mantine/core";
import { ArrowLeft, ExternalLink, Pencil } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { ErrorState } from "@/shared/ui/ErrorState";
import { PanelSkeleton } from "@/shared/ui/Skeletons";
import { RankCard } from "@/shared/ui/rank/RankCard";
import { Heatmap } from "@/shared/ui/Heatmap";
import { useTitle } from "@/shared/lib/useTitle";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { QuantalogAppGate } from "@/features/integrations/components/quantalogApps/QuantalogAppGate";
import { useBioPages } from "@/features/bio/hooks/useBioPages";
import { useBioStats } from "@/features/bio/hooks/useBioStats";
import { BIO_KIND_LABEL, publicBioDisplay, publicBioUrl } from "@/features/bio/lib/bioOptions";
import { chartPoints, toggleBioMetric, type BioMetricKey } from "@/features/bio/lib/bioMetrics";
import { toLocalHeatmap } from "@/features/bio/lib/localHeatmap";
import { BioMetricTiles } from "@/features/bio/components/stats/BioMetricTiles";
import { BioTrendChart } from "@/features/bio/components/stats/BioTrendChart";
import { BioBreakdowns } from "@/features/bio/components/stats/BioBreakdowns";
import { Segmented } from "@/features/bio/components/studio/ui/Segmented";
import studioClasses from "@/features/bio/components/studio/BioStudio.module.css";
import classes from "@/features/bio/components/stats/BioStats.module.css";

const RANGES = ["7", "30", "90", "365"] as const;
type Range = (typeof RANGES)[number];

export default function BioStats() {
  const { pageId } = useParams<{ pageId: string }>();
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const { bio: bioOn } = useWorkspaceApps();
  const workspaceId = bioOn ? active?._id : undefined;
  const { pages, loading: pagesLoading } = useBioPages(workspaceId);
  const page = pages.find((p) => p.id === pageId) ?? null;
  const [range, setRange] = useState<Range>("30");
  const [selected, setSelected] = useState<BioMetricKey[]>(["views", "visitors", "clicks"]);
  const { stats, loading, failed, retry } = useBioStats(workspaceId, page ? pageId : undefined, Number(range));
  const points = useMemo(() => (stats ? chartPoints(stats.daily) : []), [stats]);
  const heatCells = useMemo(() => (stats ? toLocalHeatmap(stats.heatmap) : []), [stats]);
  const maxDays = stats?.maxDays ?? 30;
  const ranges = RANGES.filter((r) => Number(r) <= maxDays).map((r) => ({ value: r, label: r === "365" ? "1 year" : `${r} days` }));
  useTitle(page ? `${page.title} stats` : "Stats");

  return (
    <AppShell>
      <Link to="/app/bio" className={studioClasses.back}>
        <ArrowLeft size={15} />
        Link-in-bio
      </Link>

      {!bioOn ? (
        <QuantalogAppGate app="bio" />
      ) : !pagesLoading && !page ? (
        <ErrorState title="Page not found" description="It may have been deleted. Go back to see the rest." />
      ) : (
        <>
          <PageHeader
            title={page?.title || "Stats"}
            description={page ? `${BIO_KIND_LABEL[page.kind]} · ${publicBioDisplay(page.slug)}` : undefined}
            docsPath={DOCS_SLUGS.quantalogBio}
            actions={
              page ? (
                <>
                  <Button variant="default" leftSection={<ExternalLink size={15} />} component="a" href={publicBioUrl(page.slug)} target="_blank" rel="noopener noreferrer">
                    Open page
                  </Button>
                  {canEdit && (
                    <Button leftSection={<Pencil size={15} />} component={Link} to={`/app/bio/${page.id}`}>
                      Edit
                    </Button>
                  )}
                </>
              ) : undefined
            }
          />

          <div className={classes.toolbar}>
            <Segmented size="sm" label="Date range" value={range} options={ranges} onChange={setRange} />
            {maxDays < 365 && <span className={classes.toolbarNote}>Longer history comes with a bigger plan.</span>}
          </div>

          {failed ? (
            <ErrorState onRetry={retry} />
          ) : loading || !stats || !page ? (
            <div className={classes.body}>
              <PanelSkeleton height={120} />
              <PanelSkeleton height={340} />
            </div>
          ) : (
            <div className={classes.body}>
              <BioMetricTiles stats={stats} points={points} selected={selected} onToggle={(key) => setSelected((s) => toggleBioMetric(s, key))} />
              <RankCard title="Performance" subtitle="Tap a tile above to show or hide it on the chart." tone="blue">
                <BioTrendChart points={points} selected={selected} />
              </RankCard>
              <Heatmap cells={heatCells} />
              <BioBreakdowns stats={stats} page={page} />
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
