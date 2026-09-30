import { useState } from "react";
import { Alert, Stack, Text } from "@mantine/core";
import { AlertTriangle, FileSearch } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { AppShell } from "@/app/AppShell";
import { useGetSearchConsoleStatusQuery, useGetSearchDrilldownQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import { useTitle } from "@/shared/lib/useTitle";
import { num } from "@/shared/lib";
import type { SearchType } from "@/shared/types";
import { METRIC_BY_KEY, metricChange, pagePath, type MetricKey } from "../searchMetrics";
import { SearchMetricTile } from "../components/SearchMetricTile";
import { searchPageHref } from "../useOpenSearchPage";
import { PageDetailHeader } from "../components/PageDetailHeader";
import { SearchMetricTiles, toggleMetric } from "../components/SearchMetricTiles";
import { SearchPerformanceChart } from "../components/SearchPerformanceChart";
import { SearchTopTable } from "../components/SearchTopTable";
import { SearchIndexStatusCard } from "../components/SearchIndexStatusCard";
import { SearchDrilldownDrawer } from "../components/SearchDrilldownDrawer";
import { SearchOrbitPanel } from "../components/SearchOrbitPanel";
import { useOrbitOptional } from "@/features/orbit/components/OrbitProvider";
import { useSearchOrbitExplain } from "../useSearchOrbitExplain";
import { useSearchOrbitChat } from "../useSearchOrbitChat";
import { useSearchEntitlements } from "../useSearchEntitlements";
import {
  ChartCardSkeleton,
  IndexStatusSkeleton,
  StatTilesSkeleton,
  TableCardSkeleton,
} from "../components/SearchSkeletons";
import classes from "../components/pageDetail.module.css";
import cardClasses from "../components/searchConsole.module.css";

export default function SearchConsolePageDetail() {
  const navigate = useNavigate();
  const [search, setSearch] = useSearchParams();
  const pageUrl = search.get("url") ?? "";
  const workspaceId = search.get("workspaceId") ?? "";
  const siteId = search.get("siteId") ?? "";
  const { maxDays } = useSearchEntitlements();
  const days = Math.min(Number(search.get("days") ?? "28") || 28, maxDays);
  const type = (search.get("type") as SearchType | null) ?? "web";
  const [selected, setSelected] = useState<MetricKey[]>(["clicks", "impressions"]);
  const [query, setQuery] = useState<string | null>(null);
  const [orbitOpen, setOrbitOpen] = useState(false);
  const orbitAvailable = Boolean(useOrbitOptional()?.chat.available);
  const explain = useSearchOrbitExplain({ workspaceId, siteId, days, type, pageUrl });
  const orbitChat = useSearchOrbitChat({ workspaceId, siteId, days, type, pageUrl });

  useTitle(pageUrl ? `${pagePath(pageUrl)} · Search visibility` : "Search visibility");

  const ready = Boolean(workspaceId && siteId && pageUrl);
  const { data: status } = useGetSearchConsoleStatusQuery(workspaceId, { skip: !workspaceId });
  const propertyUrl = status?.links.find((l) => l.siteId === siteId)?.propertyUrl ?? "";

  const { data, isFetching, error } = useGetSearchDrilldownQuery(
    { workspaceId, siteId, dimension: "page", value: pageUrl, days, type },
    { skip: !ready },
  );
  const loaded = data && data.value === pageUrl && !isFetching ? data : null;

  const openPage = (url: string) => navigate(searchPageHref({ workspaceId, siteId, days, type, url }));
  const setDays = (next: number) =>
    setSearch(
      (prev) => {
        const out = new URLSearchParams(prev);
        out.set("days", String(next));
        return out;
      },
      { replace: true },
    );

  if (!ready) {
    return (
      <AppShell>
        <Alert color="red" variant="light" icon={<FileSearch size={16} />}>
          This page link is incomplete. Open a page from Search visibility to see its details.
        </Alert>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Stack gap="lg">
        <PageDetailHeader
          workspaceId={workspaceId}
          siteId={siteId}
          propertyUrl={propertyUrl}
          pageUrl={pageUrl}
          days={days}
          type={type}
          onDaysChange={setDays}
          onOpenPage={openPage}
          onAskOrbit={orbitAvailable ? () => setOrbitOpen(true) : undefined}
        />

        {error && !loaded ? (
          <Alert color="red" variant="light" icon={<AlertTriangle size={16} />}>
            {errMessage(error, "Could not load this page from Google.")}
          </Alert>
        ) : loaded ? (
          <SearchMetricTiles
            columns={5}
            explain={explain}
            totals={loaded.totals}
            previous={loaded.previous}
            daily={loaded.daily}
            selected={selected}
            onToggle={(key) => setSelected((s) => toggleMetric(s, key))}
          >
            {loaded.views && (
              <SearchMetricTile
                id="views"
                label="Page views"
                color="#8b5cf6"
                value={num(loaded.views.total)}
                change={metricChange(METRIC_BY_KEY.clicks, loaded.views.total, loaded.views.previous)}
                spark={loaded.views.daily}
                sparkKey="views"
                hint="Every visit to this page tracked by Quantalog in the same period, from all sources — not just Google."
              />
            )}
          </SearchMetricTiles>
        ) : (
          <StatTilesSkeleton columns={5} />
        )}

        <div className={classes.layout}>
          {loaded ? (
            <div className={cardClasses.card}>
              <div className={cardClasses.cardHead}>
                <div>
                  <Text fw={650} size="sm">
                    Performance over time
                  </Text>
                  <Text size="xs" c="dimmed" mt={2}>
                    Last {days} days · updated {dayjs(loaded.fetchedAt).format("MMM D, HH:mm")} · tick the cards
                    above to compare
                  </Text>
                </div>
              </div>
              {loaded.daily.length > 1 ? (
                <SearchPerformanceChart daily={loaded.daily} selected={selected} />
              ) : (
                <div className={classes.noData}>
                  <Text size="sm" c="dimmed">
                    This page had no Google search activity in this period.
                  </Text>
                </div>
              )}
            </div>
          ) : (
            !error && <ChartCardSkeleton />
          )}

          <aside className={classes.side}>
            {propertyUrl ? (
              <SearchIndexStatusCard workspaceId={workspaceId} siteId={siteId} propertyUrl={propertyUrl} url={pageUrl} />
            ) : (
              <IndexStatusSkeleton />
            )}
          </aside>
        </div>

        {loaded ? (
          <SearchTopTable
            title="Queries bringing people to this page"
            description="Click a query to see its trend and the other pages ranking for it."
            labelHeader="Query"
            rows={loaded.related.map((r) => ({ ...r, label: r.key }))}
            emptyText="No queries recorded for this page in this period."
            onOpenRow={(row) => setQuery(row.key)}
          />
        ) : (
          !error && <TableCardSkeleton rows={6} columns={4} />
        )}
      </Stack>

      {orbitAvailable && (
        <SearchOrbitPanel
          opened={orbitOpen}
          onClose={() => setOrbitOpen(false)}
          chat={orbitChat}
          days={days}
          propertyUrl={propertyUrl}
          pageUrl={pageUrl}
        />
      )}

      <SearchDrilldownDrawer
        query={query}
        onClose={() => setQuery(null)}
        onOpenPage={(url) => {
          setQuery(null);
          openPage(url);
        }}
        workspaceId={workspaceId}
        siteId={siteId}
        days={days}
        type={type}
      />
    </AppShell>
  );
}
