import { useState } from "react";
import { Alert } from "@mantine/core";
import { AlertTriangle } from "lucide-react";
import { useGetSearchPerformanceQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import type { SearchType } from "@/shared/types";
import {
  SEARCH_CONSOLE_TABS,
  countryText,
  pageText,
  queryText,
  renderCountry,
  renderPage,
  renderQuery,
  type SearchConsoleTabId,
} from "../searchConsoleTabs";
import { useOpenSearchPage } from "../useOpenSearchPage";
import type { SearchConsoleLink } from "./SearchConsoleGate";
import { SearchConsoleToolbar } from "./SearchConsoleToolbar";
import { SearchDrilldownDrawer } from "./SearchDrilldownDrawer";
import { SearchOverviewTab } from "./SearchOverviewTab";
import { SearchBreakdownTab } from "./SearchBreakdownTab";
import { SearchDevicesTab } from "./SearchDevicesTab";
import { SearchInsightsTab } from "./SearchInsightsTab";
import { SearchSitemapsTab } from "./SearchSitemapsTab";
import { SearchHourlyCard } from "./SearchHourlyCard";
import { typeHasQueries } from "../searchMetrics";
import { SearchOrbitPanel } from "./SearchOrbitPanel";
import { useOrbitOptional } from "@/features/orbit/components/OrbitProvider";
import { useSearchOrbitExplain } from "../useSearchOrbitExplain";
import { useSearchOrbitChat } from "../useSearchOrbitChat";
import { useSearchEntitlements } from "../useSearchEntitlements";
import classes from "./searchConsole.module.css";
import { OverviewSkeleton } from "./SearchSkeletons";

export function SearchConsoleBody({
  workspaceId,
  siteId,
  link,
  tab,
  onTabChange,
}: {
  workspaceId: string;
  siteId: string;
  link: SearchConsoleLink;
  tab: SearchConsoleTabId;
  onTabChange: (tab: SearchConsoleTabId) => void;
}) {
  const { maxDays } = useSearchEntitlements();
  const [days, setDays] = useState(() => Math.min(28, maxDays));
  const [type, setType] = useState<SearchType>("web");
  const [query, setQuery] = useState<string | null>(null);
  const openPage = useOpenSearchPage(workspaceId, siteId, days, type);
  const orbitAvailable = Boolean(useOrbitOptional()?.chat.available);
  const [orbitOpen, setOrbitOpen] = useState(false);
  const explain = useSearchOrbitExplain({ workspaceId, siteId, days, type });
  const orbitChat = useSearchOrbitChat({ workspaceId, siteId, days, type });

  const overview = useGetSearchPerformanceQuery(
    { workspaceId, siteId, days, type },
    { skip: tab !== "overview" },
  );

  const shared = { workspaceId, siteId, days, type };
  const hasQueries = typeHasQueries(type);
  const tabs = SEARCH_CONSOLE_TABS.filter((t) => hasQueries || t.id !== "queries");

  const changeType = (next: SearchType) => {
    setType(next);
    if (!typeHasQueries(next) && tab === "queries") onTabChange("overview");
  };

  return (
    <div className={classes.page}>
      <SearchConsoleToolbar
        workspaceId={workspaceId}
        siteId={siteId}
        days={days}
        onDaysChange={setDays}
        type={type}
        onTypeChange={changeType}
        link={link}
        busy={overview.isFetching}
        fetchedAt={overview.data?.fetchedAt}
        onOpenPage={openPage}
        onAskOrbit={orbitAvailable ? () => setOrbitOpen(true) : undefined}
      />

      <div className={classes.tabbar} role="tablist" aria-label="Search visibility reports">
        {tabs.map((t) => {
          const on = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              data-active={on || undefined}
              className={classes.tab}
              onClick={() => onTabChange(t.id)}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "overview" &&
        (overview.error && !overview.data ? (
          <Alert color="red" variant="light" icon={<AlertTriangle size={16} />}>
            {errMessage(overview.error, "Search visibility data could not be loaded.")}
          </Alert>
        ) : overview.data ? (
          <SearchOverviewTab
            data={overview.data}
            hasQueries={hasQueries}
            hourly={<SearchHourlyCard workspaceId={workspaceId} siteId={siteId} type={type} />}
            onViewQueries={() => onTabChange("queries")}
            onViewPages={() => onTabChange("pages")}
            onOpenQuery={setQuery}
            onOpenPage={openPage}
            explain={explain}
          />
        ) : (
          <OverviewSkeleton />
        ))}

      {tab === "insights" && <SearchInsightsTab {...shared} onOpenQuery={setQuery} onOpenPage={openPage} />}

      {tab === "queries" && hasQueries && (
        <SearchBreakdownTab
          {...shared}
          dimension="query"
          title="Queries"
          description="Searches that showed your site in Google results. Click a query for its trend and ranking pages."
          labelHeader="Query"
          renderLabel={renderQuery}
          searchLabel={queryText}
          onOpenRow={(row) => setQuery(row.key)}
        />
      )}

      {tab === "pages" && (
        <SearchBreakdownTab
          {...shared}
          dimension="page"
          title="Pages"
          description="Your pages that appeared in Google results. Click a page for its queries and index status."
          labelHeader="Page"
          renderLabel={renderPage}
          searchLabel={pageText}
          onOpenRow={(row) => openPage(row.key)}
        />
      )}

      {tab === "countries" && (
        <SearchBreakdownTab
          {...shared}
          dimension="country"
          title="Countries"
          description="Where the people searching are."
          labelHeader="Country"
          renderLabel={renderCountry}
          searchLabel={countryText}
        />
      )}

      {tab === "devices" && <SearchDevicesTab {...shared} />}

      {tab === "sitemaps" && (
        <SearchSitemapsTab workspaceId={workspaceId} siteId={siteId} propertyUrl={link.propertyUrl} />
      )}

      {orbitAvailable && (
        <SearchOrbitPanel
          opened={orbitOpen}
          onClose={() => setOrbitOpen(false)}
          chat={orbitChat}
          days={days}
          propertyUrl={link.propertyUrl}
        />
      )}

      <SearchDrilldownDrawer
        {...shared}
        query={query}
        onClose={() => setQuery(null)}
        onOpenPage={(url) => {
          setQuery(null);
          openPage(url);
        }}
      />
    </div>
  );
}
