import { Badge, CloseButton, Group, Tabs, TextInput } from "@mantine/core";
import { Search } from "lucide-react";
import { FILTERS, type Filter } from "../hooks/usePostFilters";


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
    <Group justify="space-between" align="flex-end" wrap="wrap" gap="sm">
      {/* `outline` rather than the default underline: with every filter always
          on screen, a bar of bare words needed an edge of its own to read as a
          set of choices rather than a row of loose labels. */}
      <Tabs
        variant="outline"
        value={filter}
        onChange={(v) => onFilter((v as Filter) ?? "all")}
      >
        <Tabs.List>
          {FILTERS.map((f) => {
            const count = counts[f.value];
            // Every shelf, always, including the empty ones: a tab that comes
            // and goes as posts change moves the others under the pointer, and
            // an empty shelf is worth being able to see is empty. Its count
            // greys out rather than the tab disappearing.
            return (
              <Tabs.Tab
                key={f.value}
                value={f.value}
                rightSection={
                  <Badge
                    size="xs"
                    variant="light"
                    color={count === 0 ? "gray" : undefined}
                    circle
                  >
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

      <TextInput
        placeholder="Search posts"
        value={query}
        onChange={(e) => onQuery(e.currentTarget.value)}
        leftSection={<Search size={15} />}
        rightSection={
          query ? <CloseButton size="sm" onClick={() => onQuery("")} aria-label="Clear search" /> : null
        }
        w={240}
      />
    </Group>
  );
}
