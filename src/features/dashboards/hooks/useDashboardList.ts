import { useMemo, useState } from "react";
import type { Dashboard } from "@/features/dashboards/types";

export type DashboardSort = "edited" | "name" | "created";

export const DASHBOARD_SORTS: { value: DashboardSort; label: string }[] = [
  { value: "edited", label: "Last edited" },
  { value: "created", label: "Newest" },
  { value: "name", label: "Name A–Z" },
];

const time = (s: string) => new Date(s).getTime();

const COMPARE: Record<DashboardSort, (a: Dashboard, b: Dashboard) => number> = {
  edited: (a, b) => time(b.updatedAt) - time(a.updatedAt),
  created: (a, b) => time(b.createdAt) - time(a.createdAt),
  name: (a, b) => a.name.localeCompare(b.name),
};

export function useDashboardList(dashboards: Dashboard[]) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<DashboardSort>("edited");
  const searching = query.trim().length > 0;

  const featured = useMemo(
    () => (dashboards.length ? [...dashboards].sort(COMPARE.edited)[0] : null),
    [dashboards]
  );

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dashboards
      .filter((d) => !q || d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q))
      .filter((d) => searching || d.id !== featured?.id)
      .sort(COMPARE[sort]);
  }, [dashboards, query, sort, searching, featured]);

  return { query, setQuery, sort, setSort, searching, featured: searching ? null : featured, items };
}
