import { useEffect, useState } from "react";
import { ActionIcon, Box, Button, Group, Select, Tooltip } from "@mantine/core";
import { HelpCircle, Swords } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { HelpDrawer } from "@/shared/ui/HelpDrawer";
import { useTitle } from "@/shared/lib/useTitle";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { SitesLoadError } from "@/features/workspace";
import { CompareStartPanel } from "@/features/compare/components/start/CompareStartPanel";
import {
  useGetSitesQuery, useGetCompetitorsQuery, useGetCompetitorAnalysisQuery,
  useGetCompetitorHistoryQuery, useGetCompetitorBriefAvailabilityQuery,
} from "@/app/store";
import { AskOrbitButton } from "@/features/orbit/components/AskOrbitButton";
import { COMPARE_HELP } from "../components/help";
import { useCompetitorActions } from "../hooks/useCompetitorActions";
import { CompetitorRail } from "../components/CompetitorRail";
import { CompetitorDetail } from "../components/CompetitorDetail";
import { StandingsCard } from "../components/StandingsCard";
import { ScoreTrendChart } from "../components/ScoreTrendChart";
import { AddCompetitorForm } from "../components/AddCompetitorForm";
import { CompareSkeleton } from "../components/CompareSkeleton";
import classes from "../components/Compare.module.css";

const MAX_COMPETITORS = 10;

export default function Compare() {
  useTitle("Compare");
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const workspaceId = active?._id ?? "";

  const {
    currentData: sites = [], isLoading: sitesLoading, isError: sitesFailed,
    isFetching: sitesFetching, refetch: refetchSites,
  } = useGetSitesQuery(workspaceId, {
    skip: !workspaceId,
  });

  const [picked, setPicked] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [pickedCompetitor, setPickedCompetitor] = useState<string | null>(null);

  const site = sites.find((s) => s.siteId === picked) ?? sites[0] ?? null;
  const siteId = site?.siteId ?? "";

  useEffect(() => {
    setPickedCompetitor(null);
  }, [siteId]);

  const skip = !workspaceId || !siteId;

  const { data: competitors = [], isLoading: listLoading } = useGetCompetitorsQuery({ workspaceId, siteId }, { skip });
  const {
    data: analysis,
    isLoading: analysisLoading,
    error: analysisError,
  } = useGetCompetitorAnalysisQuery({ workspaceId, siteId }, { skip });
  const { data: history = [] } = useGetCompetitorHistoryQuery({ workspaceId, siteId }, { skip });
  const { data: briefAvailable } = useGetCompetitorBriefAvailabilityQuery({ workspaceId, siteId }, { skip });

  const { add, adding, refreshOne, refreshingId, refreshEveryone, refreshingAll, remove } =
    useCompetitorActions(workspaceId, siteId, site?.domain);

  const selected =
    analysis?.competitors.find((c) => c.competitorId === pickedCompetitor) ??
    analysis?.competitors.find((c) => c.competitorId === analysis.toughest) ??
    analysis?.competitors[0] ??
    null;

  const needsOwnAudit = analysisError && "status" in analysisError && analysisError.status === 404;
  const hasComparison = Boolean(analysis && analysis.competitors.length > 0);

  const addForm = (size: "sm" | "md" = "sm") =>
    canEdit ? (
      <AddCompetitorForm
        key={siteId}
        size={size}
        count={competitors.length}
        max={MAX_COMPETITORS}
        adding={adding}
        onAdd={add}
      />
    ) : null;

  return (
    <AppShell>
      <PageHeader
        title="Compare"
        description="How your pages stack up against your competitors', and what would close the gap."
        docsPath={DOCS_SLUGS.comparisons}
        actions={
          <Group gap="sm" wrap="nowrap">
            <Tooltip label="How comparison scoring works" withArrow>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                onClick={() => setHelpOpen(true)}
                aria-label="How comparison scoring works"
              >
                <HelpCircle size={18} />
              </ActionIcon>
            </Tooltip>
            {sites.length > 1 && (
              <Select
                size="sm"
                radius="md"
                w={200}
                value={siteId}
                onChange={(v) => setPicked(v ?? "")}
                data={sites.map((s) => ({ value: s.siteId, label: s.domain }))}
                allowDeselect={false}
              />
            )}
            {hasComparison && (
              <AskOrbitButton
                size="sm"
                label="Ask Orbit"
                question={`Looking at all my tracked competitors for ${site?.domain ?? "my site"}, what should I fix first and why?`}
              />
            )}
            {canEdit && competitors.length > 0 && (
              <Tooltip label="Re-fetch every tracked competitor and rebuild the comparison" withArrow>
                <Button
                  variant="default"
                  radius="md"
                  leftSection={<Swords size={15} />}
                  loading={refreshingAll}
                  onClick={refreshEveryone}
                >
                  Compare again
                </Button>
              </Tooltip>
            )}
          </Group>
        }
      />

      <HelpDrawer opened={helpOpen} onClose={() => setHelpOpen(false)} title="Compare" sections={COMPARE_HELP} />

      {sitesLoading || (site && (listLoading || analysisLoading)) ? (
        <CompareSkeleton />
      ) : !site && sitesFailed ? (
        <SitesLoadError onRetry={() => void refetchSites()} retrying={sitesFetching} />
      ) : !site || needsOwnAudit || !hasComparison || !analysis || !selected ? (
        <CompareStartPanel
          stage={!site ? "noSite" : needsOwnAudit ? "needsAudit" : "ready"}
          domain={site?.domain ?? ""}
          canEdit={canEdit}
          addForm={addForm("md")}
          max={MAX_COMPETITORS}
        />
      ) : (
        <>
          {analysis.position && (
            <StandingsCard
              position={analysis.position}
              myScore={analysis.mine.score}
              onSelectCompetitor={setPickedCompetitor}
            />
          )}

          <div className={classes.workspace}>
            <aside className={classes.rail}>
              <CompetitorRail
                competitors={analysis.competitors}
                selectedId={selected.competitorId}
                onSelect={setPickedCompetitor}
                myScore={analysis.mine.score}
                myDomain={site.domain}
                myFramework={site.framework}
                toughestId={analysis.toughest}
                count={competitors.length}
                max={MAX_COMPETITORS}
                addForm={addForm()}
              />
              <ScoreTrendChart history={history} competitors={analysis.competitors} myScore={analysis.mine.score} />
            </aside>

            <CompetitorDetail
              comparison={selected}
              myAuditedAt={analysis.auditedAt ?? null}
              workspaceId={workspaceId}
              siteId={siteId}
              briefAvailable={briefAvailable?.available ?? false}
              canEdit={canEdit}
              refreshing={refreshingId === selected.competitorId}
              onRefresh={() => refreshOne(selected.competitorId)}
              onDelete={() => remove(selected.competitorId, selected.label)}
            />
          </div>
        </>
      )}
      <Box h="xl" />
    </AppShell>
  );
}
