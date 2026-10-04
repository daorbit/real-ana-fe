import { useEffect, useState } from "react";
import { ActionIcon, Box, Button, Group, Select, Tooltip } from "@mantine/core";
import { HelpCircle, Link2, Plus, RotateCw, Search } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { HelpDrawer } from "@/shared/ui/HelpDrawer";
import { EmptyState } from "@/shared/ui/EmptyState";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { useTitle } from "@/shared/lib/useTitle";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { ADD_SITE_PATH } from "@/features/workspace/paths";
import { useGetSitesQuery } from "@/app/store";
import { useGetBacklinkOverviewQuery, useGetBacklinksQuery } from "../api";
import { useBacklinkActions } from "../hooks/useBacklinkActions";
import { BACKLINKS_HELP } from "../components/help";
import { SummaryStrip } from "../components/SummaryStrip";
import { BacklinksTabs, type BacklinksTabId } from "../components/BacklinksTabs";
import { YourLinksTab } from "../components/YourLinksTab";
import { CompetitorLinksTab } from "../components/CompetitorLinksTab";
import { LinkGapTab } from "../components/LinkGapTab";
import { HowItWorks } from "../components/HowItWorks";
import { IndexNotice } from "../components/IndexNotice";
import { UrlForm } from "../components/UrlForm";
import { BacklinksSkeleton } from "../components/BacklinksSkeleton";
import classes from "../components/Backlinks.module.css";

export default function Backlinks() {
  useTitle("Backlinks");
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const workspaceId = active?._id ?? "";

  const { currentData: allSites = [], isLoading: sitesLoading } = useGetSitesQuery(workspaceId, { skip: !workspaceId });
  const sites = allSites.filter((s) => s.platform !== "app" && s.domain);

  const [picked, setPicked] = useState("");
  const [tab, setTab] = useState<BacklinksTabId>("links");
  const [helpOpen, setHelpOpen] = useState(false);

  const site = sites.find((s) => s.siteId === picked) ?? sites[0] ?? null;
  const siteId = site?.siteId ?? "";
  const skip = !workspaceId || !siteId;

  const { data: overview, isLoading: overviewLoading } = useGetBacklinkOverviewQuery({ workspaceId, siteId }, { skip });
  const { data: backlinks = [], isLoading: listLoading } = useGetBacklinksQuery({ workspaceId, siteId }, { skip });
  const actions = useBacklinkActions(workspaceId, siteId);
  const { clearPageResult } = actions;

  useEffect(() => {
    clearPageResult();
  }, [siteId]);

  const notice = overview ? (
    <IndexNotice
      available={overview.indexAvailable}
      canEdit={canEdit}
      syncing={actions.syncingIndex}
      onSync={actions.importFromIndex}
    />
  ) : null;

  const renderTab = () => {
    if (tab === "how") return <HowItWorks />;
    if (!overview || !site) return null;

    if (tab === "links" && backlinks.length === 0) {
      return (
        <div className={classes.emptyAdd}>
          <EmptyState
            icon={Link2}
            compact
            title="No backlinks tracked yet"
            description={
              canEdit
                ? "Look through the last 90 days of your referrers for pages that link to you, or paste a page you know links to you."
                : "Nobody has looked for backlinks on this site yet. An editor can start it."
            }
            action={
              canEdit
                ? { label: "Find new links", icon: Search, onClick: actions.findNew, loading: actions.discovering }
                : undefined
            }
            actionNote={canEdit ? "Each referring page is fetched once to confirm the link." : undefined}
          />
          {canEdit && (
            <div className={classes.emptyForm}>
              <UrlForm
                placeholder="https://example.com/article-that-links-to-you"
                label="Track this backlink"
                hint="Or add a page you already know links to you."
                icon={Plus}
                loading={actions.adding}
                onSubmit={actions.add}
              />
            </div>
          )}
        </div>
      );
    }

    switch (tab) {
      case "links":
        return (
          <YourLinksTab
            backlinks={backlinks}
            canEdit={canEdit}
            adding={actions.adding}
            recheckingId={actions.recheckingId}
            onAdd={actions.add}
            onRecheck={actions.recheck}
            onRemove={actions.remove}
          />
        );
      case "competitors":
        return (
          <CompetitorLinksTab
            key={siteId}
            overview={overview}
            workspaceId={workspaceId}
            siteId={siteId}
            myDomain={site.domain}
            myFramework={site.framework}
            notice={notice}
          />
        );
      case "gap":
        return (
          <LinkGapTab
            gap={overview.gap}
            hasCompetitors={overview.profiles.competitors.length > 0}
            myDomain={site.domain}
            canEdit={canEdit}
            checking={actions.checkingPage}
            result={actions.pageResult}
            onCheck={actions.checkPage}
            onClearResult={actions.clearPageResult}
            notice={notice}
          />
        );
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Backlinks"
        description="Who links to you, who links to your competitors, and how each of those link profiles is built."
        docsPath={DOCS_SLUGS.seo}
        actions={
          <Group gap="sm" wrap="nowrap">
            <Tooltip label="How backlink tracking works" withArrow>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                onClick={() => setHelpOpen(true)}
                aria-label="How backlink tracking works"
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
            {canEdit && backlinks.length > 0 && (
              <Tooltip label="Fetch the 20 links that have waited longest and confirm they are still there" withArrow>
                <Button
                  variant="default"
                  radius="md"
                  leftSection={<RotateCw size={15} />}
                  loading={actions.recheckingAll}
                  onClick={actions.recheckEverything}
                >
                  Re-check
                </Button>
              </Tooltip>
            )}
            {canEdit && site && (
              <Tooltip label="Look through the last 90 days of referrers for new pages linking to you" withArrow>
                <Button
                  radius="md"
                  leftSection={<Search size={15} />}
                  loading={actions.discovering}
                  onClick={actions.findNew}
                >
                  Find new links
                </Button>
              </Tooltip>
            )}
          </Group>
        }
      />

      <HelpDrawer opened={helpOpen} onClose={() => setHelpOpen(false)} title="Backlinks" sections={BACKLINKS_HELP} />

      {sitesLoading || (site && (overviewLoading || listLoading)) ? (
        <BacklinksSkeleton />
      ) : !site ? (
        <EmptyState
          icon={Link2}
          title="No web sites yet"
          description="Backlinks are tracked for web sites with a domain. Add a site and install the tracker, and links start showing up as visitors arrive from them."
          action={{ label: "Add a site", to: ADD_SITE_PATH }}
        />
      ) : (
        <>
          {overview && <SummaryStrip summary={overview.summary} />}
          <BacklinksTabs
            active={tab}
            onChange={setTab}
            counts={{
              links: { value: overview?.summary.lostRecently ?? 0, alarm: true },
              gap: { value: overview?.summary.opportunities ?? 0 },
            }}
          />
          {renderTab()}
        </>
      )}
      <Box h="xl" />
    </AppShell>
  );
}
