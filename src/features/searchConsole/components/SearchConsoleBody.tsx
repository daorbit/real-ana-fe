import { useState } from "react";
import { Alert, SimpleGrid, Skeleton, Stack } from "@mantine/core";
import { AlertTriangle } from "lucide-react";
import { useGetSearchPerformanceQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import {
  SEARCH_CONSOLE_TABS, countryText, pageText, queryText, renderCountry, renderPage, renderQuery,
  type SearchConsoleTabId,
} from "../searchConsoleTabs";
import type { SearchConsoleLink } from "./SearchConsoleGate";
import { SearchConsoleToolbar } from "./SearchConsoleToolbar";
import { SearchOverviewTab } from "./SearchOverviewTab";
import { SearchBreakdownTab } from "./SearchBreakdownTab";
import { SearchDevicesTab } from "./SearchDevicesTab";
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
  const [days, setDays] = useState(28);
  const overview = useGetSearchPerformanceQuery(
    { workspaceId, siteId, days },
    { skip: tab !== "overview" },
  );

  const shared = { workspaceId, siteId, days };

  return (
    <div className={classes.page}>
      <SearchConsoleToolbar
        workspaceId={workspaceId}
        siteId={siteId}
        days={days}
        onDaysChange={setDays}
        link={link}
        busy={overview.isFetching}
      />

      <div className={classes.tabbar} role="tablist" aria-label="Search Console reports">
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
            {errMessage(overview.error, "Search Console data could not be loaded.")}
          </Alert>
        ) : overview.data ? (
          <SearchOverviewTab
            data={overview.data}
            onViewQueries={() => onTabChange("queries")}
            onViewPages={() => onTabChange("pages")}
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

      {tab === "queries" && (
        <SearchBreakdownTab
          {...shared}
          dimension="query"
          title="Queries"
          description="Searches that showed your site in Google results."
          labelHeader="Query"
          renderLabel={renderQuery}
          searchLabel={queryText}
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
    </div>
  );
}
