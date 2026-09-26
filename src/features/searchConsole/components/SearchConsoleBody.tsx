import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, SimpleGrid, Skeleton, Stack } from "@mantine/core";
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
import type { DrillTarget } from "./SearchDrilldownDrawer";
import type { SearchConsoleLink } from "./SearchConsoleGate";
import { SearchConsoleToolbar } from "./SearchConsoleToolbar";
import { SearchDrilldownDrawer } from "./SearchDrilldownDrawer";
import { SearchOverviewTab } from "./SearchOverviewTab";
import { SearchBreakdownTab } from "./SearchBreakdownTab";
import { SearchDevicesTab } from "./SearchDevicesTab";
import { SearchInsightsTab } from "./SearchInsightsTab";
import { SearchIndexingTab } from "./SearchIndexingTab";
import { SearchSitemapsTab } from "./SearchSitemapsTab";
import classes from "./searchConsole.module.css";

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
  const navigate = useNavigate();
  const [days, setDays] = useState(28);
  const [type, setType] = useState<SearchType>("web");
  const [drillTarget, setDrillTarget] = useState<DrillTarget | null>(null);

  const openTarget = (target: DrillTarget) => {
    if (target.dimension === "page") {
      const key = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID().slice(0, 8)
        : Math.random().toString(36).slice(2, 10);
      const params = new URLSearchParams({
        workspaceId,
        siteId,
        days: String(days),
        type,
        url: target.value,
      });
      navigate(`/app/search-visibility/page/${key}?${params.toString()}`);
      return;
    }
    setDrillTarget(target);
  };

  const overview = useGetSearchPerformanceQuery(
    { workspaceId, siteId, days, type },
    { skip: tab !== "overview" },
  );

  const shared = { workspaceId, siteId, days, type };

  return (
    <div className={classes.page}>
      <SearchConsoleToolbar
        workspaceId={workspaceId}
        siteId={siteId}
        days={days}
        onDaysChange={setDays}
        type={type}
        onTypeChange={setType}
        link={link}
        busy={overview.isFetching}
      />

      <div className={classes.tabbar} role="tablist" aria-label="Search visibility reports">
        {SEARCH_CONSOLE_TABS.map((t) => {
          const Icon = t.icon;
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
              <Icon size={15} />
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
            onViewQueries={() => onTabChange("queries")}
            onViewPages={() => onTabChange("pages")}
            onOpen={openTarget}
          />
        ) : (
          <Stack gap="md">
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} height={84} radius="md" />
              ))}
            </SimpleGrid>
            <Skeleton height={300} radius="md" />
          </Stack>
        ))}

      {tab === "insights" && <SearchInsightsTab {...shared} onOpen={openTarget} />}

      {tab === "queries" && (
        <SearchBreakdownTab
          {...shared}
          dimension="query"
          title="Queries"
          description="Searches that showed your site in Google results."
          labelHeader="Query"
          renderLabel={renderQuery}
          searchLabel={queryText}
          onOpenRow={(row) => setDrillTarget({ dimension: "query", value: row.key })}
        />
      )}

      {tab === "pages" && (
        <SearchBreakdownTab
          {...shared}
          dimension="page"
          title="Pages"
          description="Your pages that appeared in Google results."
          labelHeader="Page"
          renderLabel={renderPage}
          searchLabel={pageText}
          onOpenRow={(row) => openTarget({ dimension: "page", value: row.key })}
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

      {tab === "indexing" && overview.data && <SearchIndexingTab data={overview.data} />}

      {tab === "devices" && <SearchDevicesTab {...shared} />}

      {tab === "sitemaps" && (
        <SearchSitemapsTab workspaceId={workspaceId} siteId={siteId} propertyUrl={link.propertyUrl} />
      )}

      <SearchDrilldownDrawer
        target={drillTarget}
        onClose={() => setDrillTarget(null)}
        onOpen={(target) => setDrillTarget(target)}
        workspaceId={workspaceId}
        siteId={siteId}
        days={days}
        type={type}
      />
    </div>
  );
}
