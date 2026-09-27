import { useState } from "react";
import { Alert, Anchor, Breadcrumbs, Select, Stack, Text } from "@mantine/core";
import { AlertTriangle, BarChart3, CalendarDays, ExternalLink, FileSearch } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { AppShell } from "@/app/AppShell";
import { useGetSearchConsoleStatusQuery, useGetSearchDrilldownQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import { useTitle } from "@/shared/lib/useTitle";
import type { SearchType } from "@/shared/types";
import { RANGES, pagePath, percentDelta, type MetricKey } from "../searchMetrics";
import { StatCard } from "@/shared/ui/StatCard";
import { searchPageHref } from "../useOpenSearchPage";
import { SearchMetricTiles, toggleMetric } from "../components/SearchMetricTiles";
import { SearchPerformanceChart } from "../components/SearchPerformanceChart";
import { SearchTopTable } from "../components/SearchTopTable";
import { SearchIndexStatusCard } from "../components/SearchIndexStatusCard";
import { PageFinder } from "../components/PageFinder";
import { SearchDrilldownDrawer } from "../components/SearchDrilldownDrawer";
import {
  IndexStatusSkeleton,
  PageDetailMainSkeleton,
  StatTileSkeleton,
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
  const days = Number(search.get("days") ?? "28") || 28;
  const type = (search.get("type") as SearchType | null) ?? "web";
  const [selected, setSelected] = useState<MetricKey[]>(["clicks", "impressions"]);
  const [query, setQuery] = useState<string | null>(null);

  useTitle(pageUrl ? `${pagePath(pageUrl)} · Search visibility` : "Search visibility");

  const ready = Boolean(workspaceId && siteId && pageUrl);
  const { data: status } = useGetSearchConsoleStatusQuery(workspaceId, { skip: !workspaceId });
  const propertyUrl = status?.links.find((l) => l.siteId === siteId)?.propertyUrl ?? "";

  const { data, isFetching, error } = useGetSearchDrilldownQuery(
    { workspaceId, siteId, dimension: "page", value: pageUrl, days, type },
    { skip: !ready },
  );
  const fresh = data && data.value === pageUrl;

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
        <div className={classes.header}>
          <Breadcrumbs className={classes.crumbs}>
            <Anchor component={Link} to="/app/search-visibility?tab=pages" size="sm">
              Search visibility
            </Anchor>
            <Text size="sm" c="dimmed">
              Page
            </Text>
          </Breadcrumbs>
          <div className={classes.titleRow}>
            <div className={classes.titleText}>
              <Text className={classes.title}>{pagePath(pageUrl)}</Text>
              <Anchor href={pageUrl} target="_blank" rel="noopener noreferrer" size="xs" className={classes.url}>
                {pageUrl} <ExternalLink size={11} />
              </Anchor>
            </div>
            <div className={classes.titleActions}>
              {propertyUrl && (
                <PageFinder
                  workspaceId={workspaceId}
                  siteId={siteId}
                  propertyUrl={propertyUrl}
                  days={days}
                  type={type}
                  onOpen={openPage}
                />
              )}
              <Select
                size="sm"
                className={classes.range}
                aria-label="Date range"
                leftSection={<CalendarDays size={14} />}
                data={RANGES.map((r) => ({ value: r.value, label: `Last ${r.label}` }))}
                value={String(days)}
                onChange={(v) => v && setDays(Number(v))}
                allowDeselect={false}
              />
            </div>
          </div>
        </div>

        <div className={classes.layout}>
          <div className={classes.main}>
            {error && !fresh ? (
              <Alert color="red" variant="light" icon={<AlertTriangle size={16} />}>
                {errMessage(error, "Could not load this page from Google.")}
              </Alert>
            ) : !fresh || isFetching ? (
              <PageDetailMainSkeleton />
            ) : (
              <>
                <SearchMetricTiles
                  totals={data.totals}
                  previous={data.previous}
                  daily={data.daily}
                  selected={selected}
                  onToggle={(key) => setSelected((s) => toggleMetric(s, key))}
                />
                <div className={cardClasses.card}>
                  <div className={cardClasses.cardHead}>
                    <div>
                      <Text fw={650} size="sm">
                        Performance over time
                      </Text>
                      <Text size="xs" c="dimmed" mt={2}>
                        Last {days} days · updated {dayjs(data.fetchedAt).format("MMM D, HH:mm")}
                      </Text>
                    </div>
                  </div>
                  {data.daily.length > 1 ? (
                    <SearchPerformanceChart daily={data.daily} selected={selected} />
                  ) : (
                    <Text size="sm" c="dimmed">
                      This page had no search activity in this period.
                    </Text>
                  )}
                </div>
              </>
            )}
          </div>

          <aside className={classes.side}>
            {(!fresh || isFetching) && <StatTileSkeleton />}
            {fresh && !isFetching && data.views && (
              <StatCard
                icon={BarChart3}
                label="Page views (Quantalog)"
                value={data.views.total}
                color="green"
                delta={percentDelta(data.views.total, data.views.previous)}
                spark={data.views.daily.length > 1 ? data.views.daily : undefined}
                sparkKey="views"
                hint="Every visit to this page tracked by Quantalog in the same period, from all sources — not just Google."
              />
            )}
            {!propertyUrl && <IndexStatusSkeleton />}
            {propertyUrl && (
              <SearchIndexStatusCard
                workspaceId={workspaceId}
                siteId={siteId}
                propertyUrl={propertyUrl}
                url={pageUrl}
              />
            )}
          </aside>
        </div>

        {(!fresh || isFetching) && !error && <TableCardSkeleton rows={6} columns={4} />}
        {fresh && !isFetching && (
          <SearchTopTable
            title="Queries bringing people to this page"
            description="Click a query to see its trend and the other pages ranking for it."
            labelHeader="Query"
            rows={data.related.map((r) => ({ ...r, label: r.key }))}
            emptyText="No queries recorded for this page in this period."
            onOpenRow={(row) => setQuery(row.key)}
          />
        )}
      </Stack>

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
