import { useSearchParams } from "react-router-dom";
import { FolderKanban } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { useGetSitesQuery } from "@/app/store";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { SitesLoadError } from "@/features/workspace";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useTitle } from "@/shared/lib/useTitle";
import { SearchConsoleGate } from "../components/SearchConsoleGate";
import { SearchConsoleBody } from "../components/SearchConsoleBody";
import { SearchPageHeader } from "../components/SearchPageHeader";
import { ConsoleSkeleton } from "../components/SearchSkeletons";
import { SearchStartPanel } from "../components/start/SearchStartPanel";
import { resolveTab, type SearchConsoleTabId } from "../searchConsoleTabs";

export default function SearchConsole() {
  useTitle("Search visibility");
  const { active, loading } = useWorkspace();
  const { canEdit } = usePermissions();
  const workspaceId = active?._id ?? "";

  const {
    currentData: sites = [], isLoading: sitesLoading, isError: sitesFailed,
    isFetching: sitesFetching, refetch: refetchSites,
  } = useGetSitesQuery(workspaceId, {
    skip: !workspaceId,
  });
  const webSites = sites.filter((s) => s.platform !== "app");

  const site = webSites[0] ?? null;

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

  if (loading || sitesLoading || (sitesFailed && !sites.length) || !site) {
    return (
      <AppShell>
        <SearchPageHeader />
        {loading || sitesLoading ? (
          <ConsoleSkeleton />
        ) : !site && !(sitesFailed && !sites.length) ? (
          <SearchStartPanel canEdit={canEdit} />
        ) : (
          <SitesLoadError onRetry={() => void refetchSites()} retrying={sitesFetching} />
        )}
      </AppShell>
    );
  }

  return (
    <AppShell>
      <SearchConsoleGate workspaceId={workspaceId} siteId={site.siteId} header={<SearchPageHeader />}>
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
    </AppShell>
  );
}
