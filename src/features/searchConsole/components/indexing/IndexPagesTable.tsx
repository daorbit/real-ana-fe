import { useEffect, useMemo, useState } from "react";
import { ScrollArea, Table, TextInput } from "@mantine/core";
import { ChevronRight, Search } from "lucide-react";
import { timeAgo } from "@/shared/lib";
import { Chip } from "@/shared/ui/Chip";
import { FilterChips } from "@/shared/ui/FilterChips";
import { Pill } from "@/features/seo/components/shared/Pill";
import type { SearchIndexPage } from "@/shared/types";
import { INDEX_STATES, matchesIndexFilter, type IndexCounts, type IndexFilter } from "../../indexing";
import { METRIC_BY_KEY, pagePath } from "../../searchMetrics";
import { SearchPager } from "../SearchPager";
import { SearchSectionHead } from "../SearchSectionHead";
import layout from "../searchConsole.module.css";
import classes from "./indexing.module.css";

const PAGE_SIZE = 25;

const FILTERS: { value: IndexFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "indexed", label: "On Google" },
  { value: "not_indexed", label: "Not on Google" },
  { value: "blocked", label: "Blocked" },
  { value: "unchecked", label: "Not checked" },
];

function StatusCell({ check }: { check: SearchIndexPage["check"] }) {
  if (!check) return <Pill>Not checked</Pill>;
  const state = INDEX_STATES[check.state];
  return <Pill tone={state.tone}>{state.label}</Pill>;
}

export function IndexPagesTable({
  pages,
  days,
  counts,
  filter,
  reason,
  onFilterChange,
  onClearReason,
  onOpenPage,
}: {
  pages: SearchIndexPage[];
  days: number;
  counts: IndexCounts;
  filter: IndexFilter;
  reason: string | null;
  onFilterChange: (filter: IndexFilter) => void;
  onClearReason: () => void;
  onOpenPage: (url: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const q = query.trim().toLowerCase();

  useEffect(() => setPage(1), [q, filter, reason]);

  const rows = useMemo(
    () =>
      pages.filter(
        (p) =>
          matchesIndexFilter(p, filter) &&
          (!reason || p.check?.reason === reason) &&
          (!q || p.url.toLowerCase().includes(q)),
      ),
    [pages, filter, reason, q],
  );
  const lastPage = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, lastPage);
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <section className={layout.group}>
      <SearchSectionHead
        large
        title="Pages"
        description={`Clicks are from the last ${days} days. Opening a page shows its full inspection and uses a check if it's out of date.`}
        right={
          <TextInput
            size="sm"
            radius="md"
            className={layout.searchInput}
            placeholder="Search pages"
            leftSection={<Search size={14} />}
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            aria-label="Search pages"
          />
        }
      />
      <div className={classes.filters}>
        <FilterChips
          ariaLabel="Index status"
          value={filter}
          onChange={(value) => onFilterChange(value as IndexFilter)}
          data={FILTERS.map((f) => ({ ...f, count: counts[f.value].toLocaleString() }))}
        />
        {reason && (
          <Chip active removable title="Remove this filter" onClick={onClearReason}>
            {reason}
          </Chip>
        )}
      </div>

      <div className={layout.listCard}>
        {visible.length === 0 ? (
          <p className={layout.emptyRow}>{pages.length ? "No pages match." : "No pages found for this property yet."}</p>
        ) : (
          <ScrollArea className={layout.tableScroll}>
            <Table fz="xs" className={layout.table} highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Page</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Reason</Table.Th>
                  <Table.Th className={layout.numCell}>Clicks</Table.Th>
                  <Table.Th className={layout.numCell}>Last crawl</Table.Th>
                  <Table.Th className={layout.numCell}>Checked</Table.Th>
                  <Table.Th className={layout.chevronCell} />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {visible.map((row) => (
                  <Table.Tr key={row.url} className={layout.clickableRow} onClick={() => onOpenPage(row.url)}>
                    <Table.Td className={layout.labelCell} title={row.url}>
                      {pagePath(row.url)}
                    </Table.Td>
                    <Table.Td>
                      <StatusCell check={row.check} />
                    </Table.Td>
                    <Table.Td className={`${layout.labelCell} ${layout.mutedCell}`} title={row.check?.reason}>
                      {row.check?.reason ?? (row.inSitemap ? "In your sitemap" : "Seen in Google results")}
                    </Table.Td>
                    <Table.Td className={`${layout.numCell} ${layout.mutedCell}`}>
                      {row.clicks === null ? "—" : METRIC_BY_KEY.clicks.format(row.clicks)}
                    </Table.Td>
                    <Table.Td className={`${layout.numCell} ${layout.mutedCell}`}>
                      {row.check?.lastCrawled ? timeAgo(row.check.lastCrawled) : "—"}
                    </Table.Td>
                    <Table.Td className={`${layout.numCell} ${layout.mutedCell}`}>
                      {row.check ? timeAgo(row.check.checkedAt) : "—"}
                    </Table.Td>
                    <Table.Td className={layout.chevronCell}>
                      <ChevronRight size={14} />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        )}
      </div>
      <SearchPager page={current} pageSize={PAGE_SIZE} total={rows.length} onChange={setPage} />
    </section>
  );
}
