import { Select, TextInput } from "@mantine/core";
import { ArrowUpDown, Search } from "lucide-react";
import { DASHBOARD_SORTS } from "@/features/dashboards/hooks/useDashboardList";
import type { DashboardSort } from "@/features/dashboards/hooks/useDashboardList";
import classes from "@/features/dashboards/components/home/Home.module.css";

export function LibraryToolbar({
  title,
  count,
  showControls,
  query,
  sort,
  onQuery,
  onSort,
}: {
  title: string;
  count: number;
  showControls: boolean;
  query: string;
  sort: DashboardSort;
  onQuery: (query: string) => void;
  onSort: (sort: DashboardSort) => void;
}) {
  return (
    <div className={classes.libraryHead}>
      <h3 className={classes.sectionTitle}>
        {title}
        <span className={classes.sectionCount}>{count}</span>
      </h3>
      {showControls && (
        <div className={classes.libraryControls}>
          <TextInput
            className={classes.librarySearch}
            leftSection={<Search size={15} />}
            placeholder="Search dashboards"
            value={query}
            onChange={(e) => onQuery(e.currentTarget.value)}
            aria-label="Search dashboards"
          />
          <Select
            className={classes.librarySort}
            leftSection={<ArrowUpDown size={14} />}
            data={DASHBOARD_SORTS}
            value={sort}
            onChange={(v) => v && onSort(v as DashboardSort)}
            allowDeselect={false}
            aria-label="Sort dashboards"
          />
        </div>
      )}
    </div>
  );
}
