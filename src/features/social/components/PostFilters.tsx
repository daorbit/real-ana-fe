import { Tabs } from "@mantine/core";
import { FILTERS, type Filter } from "../hooks/usePostFilters";
import classes from "./SocialQueue.module.css";

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
        {FILTERS.map((f) => (
          <Tabs.Tab
            key={f.value}
            value={f.value}
            rightSection={
              f.value !== "sent" && f.value !== "failed" ? (
                <span className={classes.tabCount}>{counts[f.value]}</span>
              ) : undefined
            }
          >
            {f.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs>
  );
}
