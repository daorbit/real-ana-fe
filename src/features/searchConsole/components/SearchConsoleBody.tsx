import { useMemo, useState } from "react";
import { useGetSearchPerformanceQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import { DOCS_SLUGS, docsUrl } from "@/shared/lib/docsSlugs";
import { ErrorState } from "@/shared/ui/ErrorState";
import { pageTabId, pageTabPanelId } from "@/shared/ui/pageTabIds";
import { SearchSegmented } from "./SearchSegmented";
import { useDemo } from "@/features/demo/context";
import { demoSearchPerformance } from "@/features/demo/demoSearchConsole";
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
import { SearchPageHeader } from "./SearchPageHeader";
import { PageFinder } from "./PageFinder";
import { SearchQuerySheet } from "./SearchQuerySheet";
import { askAboutQueryPrompt } from "../searchOrbitPrompts";
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

  const realOverview = useGetSearchPerformanceQuery(
    { workspaceId, siteId, days, type },
    { skip: tab !== "overview" },
  );

  const { demo } = useDemo();
  const demoOverview = useMemo(() => (demo ? demoSearchPerformance(days, type) : null), [demo, days, type]);
  const overview = demoOverview
    ? { data: demoOverview, isFetching: false, error: undefined }
    : realOverview;

  const shared = { workspaceId, siteId, days, type };
  const hasQueries = typeHasQueries(type);
  const tabs = SEARCH_CONSOLE_TABS.filter((t) => hasQueries || t.id !== "queries");
  const tabDef = tabs.find((t) => t.id === tab) ?? tabs[0];

  const askAboutQuery = (text: string) => {
    setQuery(null);
    setOrbitOpen(true);
    orbitChat.send(askAboutQueryPrompt(text));
  };

  const changeType = (next: SearchType) => {
    setType(next);
    if (!typeHasQueries(next) && tab === "queries") onTabChange("overview");
  };

  return (
    <>
      <SearchPageHeader
        actions={
          <PageFinder
            workspaceId={workspaceId}
            siteId={siteId}
            propertyUrl={link.propertyUrl}
            days={days}
            type={type}
            onOpen={openPage}
          />
        }
      />

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
        />

        <div className={classes.tabHead}>
          <SearchSegmented
            items={tabs.map((t) => ({ value: t.id, label: t.label }))}
            value={tab}
            onChange={onTabChange}
            label="Search visibility reports"
            tabsId="search"
          />
          <p className={classes.tabIntro}>
            {tabDef.intro}{" "}
            <a href={docsUrl(DOCS_SLUGS.searchVisibility)} target="_blank" rel="noreferrer" className={classes.learnMore}>
              Learn more
            </a>
          </p>
        </div>

        <div
          role="tabpanel"
          id={pageTabPanelId("search", tab)}
          aria-labelledby={pageTabId("search", tab)}
          className={classes.panel}
        >
          {tab === "overview" &&
            (overview.error && !overview.data ? (
              <ErrorState
                compact
                title="Couldn't load from Google"
                description={errMessage(overview.error, "Search visibility data could not be loaded.")}
                onRetry={realOverview.refetch}
                retrying={realOverview.isFetching}
              />
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
              description="Tap a query for its trend and the pages ranking for it."
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
              description="Tap a page for its queries and index status."
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
              description="Clicks and rankings by the searcher's country."
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

        {orbitAvailable && (
          <SearchOrbitPanel
            opened={orbitOpen}
            onClose={() => setOrbitOpen(false)}
            chat={orbitChat}
            days={days}
            propertyUrl={link.propertyUrl}
          />
        )}

        <SearchQuerySheet
          {...shared}
          query={query}
          onClose={() => setQuery(null)}
          onOpenPage={(url) => {
            setQuery(null);
            openPage(url);
          }}
          onAskOrbit={orbitAvailable ? askAboutQuery : undefined}
        />
      </div>
    </>
  );
}
