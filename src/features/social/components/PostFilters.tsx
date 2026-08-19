import { Badge, CloseButton, Tabs, TextInput } from "@mantine/core";
import { Search } from "lucide-react";
import { FILTERS, type Filter } from "../hooks/usePostFilters";

/**
 * Which subset of the list is showing, and a search across it.
 *
 * One bar, with the rule beneath it running the full width of the page rather
 * than stopping after the last tab: a line that ends mid-air reads as a broken
 * edge, where one that reaches both margins reads as the boundary between the
 * controls and the list they filter.
 */
export function PostFilters({
  filter,
  onFilter,
  query,
  onQuery,
  counts,
}: {
  filter: Filter;
  onFilter: (f: Filter) => void;
  query: string;
  onQuery: (q: string) => void;
  counts: Record<Filter, number>;
}) {
  return (
    <Tabs
      className="post-filters"
      value={filter}
      onChange={(v) => onFilter((v as Filter) ?? "all")}
    >
      <Tabs.List>
        {FILTERS.map((f) => {
          const count = counts[f.value];
          // Every shelf, always, including the empty ones: a tab that comes and
          // goes as posts change moves the others under the pointer, and an
          // empty shelf is worth being able to see is empty.
          return (
            <Tabs.Tab
              key={f.value}
              value={f.value}
              rightSection={
                <Badge size="xs" variant="light" color={count === 0 ? "gray" : undefined} circle>
                  {count}
                </Badge>
              }
            >
              {f.label}
            </Tabs.Tab>
          );
        })}

        {/* Inside the tab list, pushed to the far end: it filters the same list
            the tabs do, and sitting outside the bar made it read as a
            page-wide search. */}
        <TextInput
          className="post-filters__search"
          placeholder="Search posts"
          value={query}
          onChange={(e) => onQuery(e.currentTarget.value)}
          leftSection={<Search size={15} />}
          rightSection={
            query ? <CloseButton size="sm" onClick={() => onQuery("")} aria-label="Clear search" /> : null
          }
        />
      </Tabs.List>
    </Tabs>
  );
}
