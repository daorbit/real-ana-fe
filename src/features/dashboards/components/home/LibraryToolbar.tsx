import { SegmentedControl, Select, TextInput } from "@mantine/core";
import { ArrowUpDown, LayoutGrid, List, Search } from "lucide-react";
import { DASHBOARD_SORTS } from "@/features/dashboards/hooks/useDashboardList";
import type { DashboardSort } from "@/features/dashboards/hooks/useDashboardList";
import classes from "@/features/dashboards/components/home/Home.module.css";

export type LibraryView = "grid" | "list";

const VIEWS = [
  { value: "grid", label: <LayoutGrid size={15} aria-label="Grid view" /> },
  { value: "list", label: <List size={15} aria-label="List view" /> },
];

export function LibraryToolbar({
  count,
  query,
  sort,
  view,
  onQuery,
  onSort,
  onView,
}: {
  count: number;
  query: string;
  sort: DashboardSort;
  view: LibraryView;
  onQuery: (query: string) => void;
  onSort: (sort: DashboardSort) => void;
  onView: (view: LibraryView) => void;
}) {
  return (
    <div className={classes.libraryHead}>
      <span className={classes.libraryCount}>
        All dashboards<span>{count}</span>
      </span>
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
        <SegmentedControl
          value={view}
          onChange={(v) => onView(v as LibraryView)}
          data={VIEWS}
          classNames={{ label: classes.viewLabel }}
          aria-label="Layout"
        />
      </div>
    </div>
  );
}
