import { Badge, Tabs } from "@mantine/core";
import { FILTERS, type Filter } from "../hooks/usePostFilters";

/**
 * Which shelf of the queue is showing.
 *
 * One bar, with the rule beneath it running the full width of the page rather
 * than stopping after the last tab: a line that ends mid-air reads as a broken
 * edge, where one that reaches both margins reads as the boundary between the
 * controls and the list they filter.
 */
export function PostFilters({
  filter,
  onFilter,
  counts,
}: {
  filter: Filter;
  onFilter: (f: Filter) => void;
  counts: Record<Filter, number>;
}) {
  return (
    <Tabs
      className="post-filters"
      value={filter}
      onChange={(v) => onFilter((v as Filter) ?? "queue")}
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
                <Badge size="sm" variant="light" color={count === 0 ? "gray" : undefined} circle>
                  {count}
                </Badge>
              }
            >
              {f.label}
            </Tabs.Tab>
          );
        })}
      </Tabs.List>
    </Tabs>
  );
}
