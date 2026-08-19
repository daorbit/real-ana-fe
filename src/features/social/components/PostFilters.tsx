import { Badge, Tabs } from "@mantine/core";
import { Zap } from "lucide-react";
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
                // Approvals carries a mark rather than a number: the shelf has
                // no count to give yet, and a permanent "0" reads as a feature
                // that is broken rather than one that is coming.
                f.value === "approvals" ? (
                  <Badge size="xs" variant="filled" color="violet" circle>
                    <Zap size={9} fill="currentColor" strokeWidth={0} />
                  </Badge>
                ) : (
                  <Badge size="xs" variant="light" color={count === 0 ? "gray" : undefined} circle>
                    {count}
                  </Badge>
                )
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
