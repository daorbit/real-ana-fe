import { useEffect, useState } from "react";
import {
  Box, Button, Card, Center, Group, Loader, Select, SimpleGrid, Stack,
  Text, TextInput, ThemeIcon, Tooltip, ActionIcon,
} from "@mantine/core";
import { HelpCircle, Plus, RefreshCw, Swords, Target, Trash2 } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { HelpDrawer } from "@/shared/ui/HelpDrawer";
import { COMPARE_HELP } from "@/features/compare/components/help";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import {
  useGetSitesQuery, useGetCompetitorsQuery, useGetCompetitorAnalysisQuery,
  useGetCompetitorHistoryQuery, useAddCompetitorMutation,
  useRefreshCompetitorMutation, useRefreshAllCompetitorsMutation,
  useDeleteCompetitorMutation,
} from "@/app/store";
import { notify, notifyError, confirmDelete } from "@/shared/lib/notify";
import { timeAgo } from "@/shared/lib";
import { AskOrbitButton } from "@/features/orbit/components/AskOrbitButton";
import { GapCard } from "@/features/compare/components/GapCard";
import { MetricMatrix } from "@/features/compare/components/MetricMatrix";
import { ScoreTrendChart } from "@/features/compare/components/ScoreTrendChart";

/**
 * How your pages compare to your competitors'.
 *
 * Its own page rather than a tab inside the SEO report, because the question is
 * ongoing rather than per-audit: a report is a snapshot of one URL, while this
 * is a set of rivals watched over time.
 *
 * Everything shown is derived from one fetch of a publicly reachable page.
 * Lighthouse is never run against a competitor — it costs quota that belongs to
 * the customer's own sites — so both sides are scored on on-page signals alone
 * and the page says so rather than leaving the reader to assume otherwise.
 */

/** Matches the server's ceiling; the input disables itself here rather than 400ing. */
const MAX_COMPETITORS = 10;

export default function Compare() {
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const workspaceId = active?._id ?? "";

  // `currentData` rather than `data`: the latter holds the previous
  // workspace's sites across a switch, offering a picker full of properties
  // this workspace does not own.
  const { currentData: sites = [], isLoading: sitesLoading } = useGetSitesQuery(workspaceId, {
    skip: !workspaceId,
  });

  const [picked, setPicked] = useState("");
  const [url, setUrl] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);

  // Derived during render rather than stored, so the first render after a
  // workspace switch already targets a real site instead of firing a request
  // at the previous workspace's.
  const site = sites.find((s) => s.siteId === picked) ?? sites[0] ?? null;
  const siteId = site?.siteId ?? "";

  useEffect(() => {
    setUrl("");
  }, [siteId]);

  const skip = !workspaceId || !siteId;

  const { data: competitors = [], isLoading: listLoading } = useGetCompetitorsQuery(
    { workspaceId, siteId },
    { skip }
  );
  const {
    data: analysis,
    isLoading: analysisLoading,
    error: analysisError,
  } = useGetCompetitorAnalysisQuery({ workspaceId, siteId }, { skip });
  const { data: history = [] } = useGetCompetitorHistoryQuery({ workspaceId, siteId }, { skip });

  const [addCompetitor, { isLoading: adding }] = useAddCompetitorMutation();
  const [refreshCompetitor] = useRefreshCompetitorMutation();
  const [refreshAll, { isLoading: refreshingAll }] = useRefreshAllCompetitorsMutation();
  const [deleteCompetitor] = useDeleteCompetitorMutation();

  const atLimit = competitors.length >= MAX_COMPETITORS;

  const add = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    try {
      await addCompetitor({ workspaceId, siteId, url: trimmed }).unwrap();
      setUrl("");
      notify.success(`Fetched and compared against ${site?.domain ?? "your site"}.`, "Competitor added");
    } catch (e) {
      notifyError(e, "Could not add competitor");
    }
  };

  const refreshOne = async (competitorId: string) => {
    try {
      await refreshCompetitor({ workspaceId, siteId, competitorId }).unwrap();
    } catch (e) {
      notifyError(e, "Refresh failed");
    }
  };

  const refreshEveryone = async () => {
    try {
      const result = await refreshAll({ workspaceId, siteId }).unwrap();
      notify.success(
        result.failed > 0
          ? `${result.refreshed} updated, ${result.failed} could not be reached.`
          : `${result.refreshed} updated.`,
        "Competitors refreshed"
      );
    } catch (e) {
      notifyError(e, "Refresh failed");
    }
  };

  const remove = (competitorId: string, label: string) => {
    confirmDelete({
      title: "Remove competitor",
      body: `Stop tracking ${label}? Their recorded score history goes too.`,
      onConfirm: async () => {
        try {
          await deleteCompetitor({ workspaceId, siteId, competitorId }).unwrap();
        } catch (e) {
          notifyError(e, "Could not remove competitor");
        }
      },
    });
  };

  // A 404 here means the site has no audit of its own, which is a different
  // problem from a broken request and needs a different answer.
  const needsOwnAudit =
    analysisError && "status" in analysisError && analysisError.status === 404;

  return (
    <AppShell>
      <PageHeader
        title="Compare"
        description="How your pages stack up against your competitors', and what would close the gap."
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
            {analysis && analysis.competitors.length > 0 && (
              <AskOrbitButton
                size="sm"
                label="Ask Orbit"
                question={`Looking at all my tracked competitors for ${site?.domain ?? "my site"}, what should I fix first and why?`}
              />
            )}
            {canEdit && competitors.length > 0 && (
              <Button
                variant="default"
                radius="md"
                leftSection={<RefreshCw size={15} />}
                loading={refreshingAll}
                onClick={refreshEveryone}
              >
                Refresh all
              </Button>
            )}
          </Group>
        }
      />

      <HelpDrawer
        opened={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Compare"
        sections={COMPARE_HELP}
      />

      {sitesLoading ? (
        <Center py="xl">
          <Loader size="sm" />
        </Center>
      ) : !site ? (
        <Card withBorder radius="md" padding="xl">
          <Center>
            <Stack align="center" gap="xs" maw={420}>
              <ThemeIcon size={48} radius="xl" variant="light" color="gray">
                <Swords size={24} />
              </ThemeIcon>
              <Text fw={650}>No sites yet</Text>
              <Text size="sm" c="dimmed" ta="center">
                Add a site and run an audit on it first — a comparison needs a
                baseline of your own to measure against.
              </Text>
            </Stack>
          </Center>
        </Card>
      ) : (
        <Stack gap="lg">
          {canEdit && (
            <Card withBorder radius="md" padding="lg">
              <Group gap="sm" align="flex-end" wrap="wrap">
                <Box style={{ flex: "1 1 320px", minWidth: 240 }}>
                  <Text component="label" htmlFor="competitor-url" size="sm" fw={500} display="block" mb={4}>
                    Competitor URL
                  </Text>
                  <TextInput
                    id="competitor-url"
                    placeholder="https://competitor.com/page"
                    value={url}
                    onChange={(e) => setUrl(e.currentTarget.value)}
                    onKeyDown={(e) => e.key === "Enter" && !adding && add()}
                    radius="md"
                    disabled={atLimit}
                  />
                </Box>
                <Button
                  color="emerald"
                  radius="md"
                  leftSection={<Plus size={15} />}
                  loading={adding}
                  onClick={add}
                  disabled={atLimit}
                >
                  Track
                </Button>
              </Group>
              <Text size="xs" c="dimmed" mt="sm">
                {atLimit
                  ? `You are tracking the maximum of ${MAX_COMPETITORS}. Remove one to add another.`
                  : `${competitors.length} of ${MAX_COMPETITORS} tracked. Only publicly reachable pages can be fetched — a page behind a login or a firewall cannot be compared.`}
              </Text>
            </Card>
          )}

          {(listLoading || analysisLoading) && (
            <Center py="xl">
              <Loader size="sm" />
            </Center>
          )}

          {needsOwnAudit && (
            <Card withBorder radius="md" padding="xl">
              <Center>
                <Stack align="center" gap="xs" maw={440}>
                  <ThemeIcon size={48} radius="xl" variant="light" color="yellow">
                    <Target size={24} />
                  </ThemeIcon>
                  <Text fw={650}>Run an audit on your own site first</Text>
                  <Text size="sm" c="dimmed" ta="center">
                    A comparison measures competitors against your page. Until{" "}
                    {site.domain} has been audited there is no baseline to compare them
                    to — open the SEO page and run one.
                  </Text>
                </Stack>
              </Center>
            </Card>
          )}

          {!listLoading && !needsOwnAudit && competitors.length === 0 && (
            <Card withBorder radius="md" padding="xl">
              <Center>
                <Stack align="center" gap="xs" maw={440}>
                  <ThemeIcon size={48} radius="xl" variant="light" color="emerald">
                    <Swords size={24} />
                  </ThemeIcon>
                  <Text fw={650}>Nothing to compare yet</Text>
                  <Text size="sm" c="dimmed" ta="center">
                    {canEdit
                      ? "Track a competitor's page to see where they beat you — the sections they cover, the schema they mark up, and the terms they rank for that your page never mentions."
                      : "Nobody has tracked a competitor for this site yet. An editor can add one."}
                  </Text>
                </Stack>
              </Center>
            </Card>
          )}

          {analysis && analysis.competitors.length > 0 && (
            <>
              <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
                {analysis.competitors.map((c) => (
                  <GapCard
                    key={c.competitorId}
                    comparison={c}
                    isToughest={analysis.toughest === c.competitorId}
                  />
                ))}
              </SimpleGrid>

              <ScoreTrendChart
                history={history}
                competitors={analysis.competitors}
                myScore={analysis.mine.score}
              />

              <MetricMatrix
                competitors={analysis.competitors}
                myLabel={site.domain}
              />

              <Card withBorder radius="md" padding="lg">
                <Text fw={650} size="sm" mb="md">
                  Tracked pages
                </Text>
                <Stack gap={0}>
                  {competitors.map((c) => (
                    <Group key={c._id} justify="space-between" wrap="nowrap" py={8}>
                      <Box style={{ minWidth: 0 }}>
                        <Text size="sm" fw={500} truncate>
                          {c.label}
                        </Text>
                        <Text size="xs" c="dimmed" truncate>
                          {c.lastError
                            ? c.lastError
                            : c.lastCheckedAt
                            ? `Checked ${timeAgo(c.lastCheckedAt)}`
                            : "Not checked yet"}
                        </Text>
                      </Box>
                      {canEdit && (
                        <Group gap={4} wrap="nowrap">
                          <Tooltip label="Re-fetch" withArrow>
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              size="sm"
                              onClick={() => refreshOne(c._id)}
                            >
                              <RefreshCw size={14} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Stop tracking" withArrow>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              size="sm"
                              onClick={() => remove(c._id, c.label)}
                            >
                              <Trash2 size={14} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      )}
                    </Group>
                  ))}
                </Stack>
              </Card>
            </>
          )}
        </Stack>
      )}
      <Box h="xl" />
    </AppShell>
  );
}
