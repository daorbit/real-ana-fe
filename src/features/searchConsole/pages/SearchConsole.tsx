import { useSearchParams } from "react-router-dom";
import { Select, Skeleton } from "@mantine/core";
import { FolderKanban, Globe } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { useGetSitesQuery } from "@/app/store";
import { useWorkspace } from "@/features/workspace/context";
import { useSiteScope } from "@/features/analytics";
import { PageHeader } from "@/shared/ui/Page";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useTitle } from "@/shared/lib/useTitle";
import { SearchConsoleGate } from "../components/SearchConsoleGate";
import { SearchConsoleBody } from "../components/SearchConsoleBody";
import { resolveTab, type SearchConsoleTabId } from "../searchConsoleTabs";
import classes from "../components/searchConsole.module.css";

export default function SearchConsole() {
  useTitle("Search visibility");
  const { active, loading } = useWorkspace();
  const workspaceId = active?._id ?? "";

  const { currentData: sites = [], isLoading: sitesLoading } = useGetSitesQuery(workspaceId, {
    skip: !workspaceId,
  });
  const webSites = sites.filter((s) => s.platform !== "app");

  const [siteScope, setSiteScope] = useSiteScope(workspaceId || undefined);
  const site = webSites.find((s) => s.siteId === siteScope[0]) ?? webSites[0] ?? null;

  const [params, setParams] = useSearchParams();
  const tab = resolveTab(params.get("tab"));
  const setTab = (next: SearchConsoleTabId) =>
    setParams(
      (prev) => {
        const out = new URLSearchParams(prev);
        if (next === "overview") out.delete("tab");
        else out.set("tab", next);
        return out;
      },
      { replace: true },
    );

  if (!loading && !active) {
    return (
      <AppShell>
        <EmptyState
          icon={FolderKanban}
          title="No workspace selected"
          description="Search visibility data belongs to the sites inside a workspace. Pick one — or create your first."
          action={{ label: "Go to Workspaces", to: "/app/workspaces" }}
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Search visibility"
        description="How your sites appear in Google Search — clicks, impressions, queries, pages and sitemaps, straight from Google."
        actions={
          webSites.length > 0 && (
            <Select
              className={classes.siteSelect}
              aria-label="Site"
              data={webSites.map((s) => ({ value: s.siteId, label: s.name }))}
              value={site?.siteId ?? null}
              onChange={(v) => v && setSiteScope([v])}
              allowDeselect={false}
              leftSection={<Globe size={15} />}
            />
          )
        }
      />

      {loading || sitesLoading ? (
        <Skeleton height={320} radius="md" />
      ) : !site ? (
        <EmptyState
          icon={Globe}
          title="Add a website first"
          description="Search visibility data is shown per website. Add a site to this workspace, then link its Google Search property here."
          action={{ label: "Manage sites", to: "/app/workspaces" }}
        />
      ) : (
        <SearchConsoleGate workspaceId={workspaceId} siteId={site.siteId}>
          {(link) => (
            <SearchConsoleBody
              key={site.siteId}
              workspaceId={workspaceId}
              siteId={site.siteId}
              link={link}
              tab={tab}
              onTabChange={setTab}
            />
          )}
        </SearchConsoleGate>
      )}
    </AppShell>
  );
}
