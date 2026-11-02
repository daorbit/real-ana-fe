import { ActionIcon, Button, Group, Menu, Tooltip, UnstyledButton } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { CalendarClock, Check, ChevronDown, Plus, Rows3, X } from "lucide-react";
import type { WorkspaceMember } from "@/shared/types";
import { GROUP_LABEL } from "../lib/board";
import type { BoardView, DueFilter, GroupBy } from "../types";
import { PeopleFilter } from "./PeopleFilter";
import { TaskSearchInput } from "./TaskSearchInput";
import { DUE_FILTERS, dueFilterLabel, GROUPS, VIEWS } from "./toolbarOptions";
import { MobileFilterSheet } from "./mobile/MobileFilterSheet";
import { MobileViewMenu } from "./mobile/MobileViewMenu";
import mobileClasses from "./mobile/MobileControls.module.css";
import classes from "./Tasks.module.css";

export function TasksToolbar({
  query,
  onQuery,
  members,
  people,
  onTogglePerson,
  onRemovePerson,
  onClearFilters,
  dueFilter,
  onDueFilter,
  groupBy,
  onGroupBy,
  view,
  onView,
  onAdd,
}: {
  query: string;
  onQuery: (value: string) => void;
  members: WorkspaceMember[];
  people: Set<string>;
  onTogglePerson: (id: string) => void;
  onRemovePerson: (id: string) => void;
  onClearFilters: () => void;
  dueFilter: DueFilter;
  onDueFilter: (filter: DueFilter) => void;
  groupBy: GroupBy;
  onGroupBy: (value: GroupBy) => void;
  view: BoardView;
  onView: (value: BoardView) => void;
  onAdd?: () => void;
}) {
  const filtersActive = Boolean(query.trim() || people.size || dueFilter !== "all");
  const wideViews = useMediaQuery("(min-width: 90em)") ?? false;

  return (
    <div className={classes.toolbar}>
      <div className={classes.searchRow}>
        <TaskSearchInput className={classes.search} hiddenFrom="sm" query={query} onQuery={onQuery} />
        {onAdd && (
          <ActionIcon hiddenFrom="sm" size={40} radius="xl" onClick={onAdd} aria-label="Add task">
            <Plus size={20} />
          </ActionIcon>
        )}
      </div>

      <div className={mobileClasses.row}>
        <MobileViewMenu view={view} onView={onView} />
        <MobileFilterSheet
          view={view}
          members={members}
          people={people}
          onTogglePerson={onTogglePerson}
          dueFilter={dueFilter}
          onDueFilter={onDueFilter}
          groupBy={groupBy}
          onGroupBy={onGroupBy}
          onClearFilters={onClearFilters}
        />
      </div>

      <Group gap={2} wrap="nowrap" className={`range-segmented ${classes.views}`} role="tablist" aria-label="View">
        {VIEWS.map(({ value, label, icon: Icon }) => (
          <Tooltip key={value} label={label} withArrow disabled={wideViews}>
            <UnstyledButton
              role="tab"
              aria-selected={view === value}
              className="range-seg-btn"
              data-active={view === value}
              onClick={() => onView(value)}
              aria-label={label}
            >
              <Icon size={14} className={classes.viewIcon} />
              <span className={classes.viewLabel}>{label}</span>
            </UnstyledButton>
          </Tooltip>
        ))}
      </Group>
      <span className={classes.spacer} />

      <div className={classes.filterRow}>
        <PeopleFilter members={members} selected={people} onToggle={onTogglePerson} />
        <Menu position="bottom-start" width={180}>
          <Menu.Target>
            <Button
              variant={dueFilter !== "all" ? "light" : "default"}
              size="sm"
              leftSection={<CalendarClock size={15} />}
              rightSection={<ChevronDown size={14} />}
              aria-label={`Due date filter: ${dueFilterLabel(dueFilter)}`}
            >
              {dueFilterLabel(dueFilter)}
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {DUE_FILTERS.map((item) => (
              <Menu.Item
                key={item.value}
                onClick={() => onDueFilter(item.value)}
                rightSection={item.value === dueFilter ? <Check size={14} /> : null}
              >
                {item.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
        {view === "board" && (
          <Menu position="bottom-end" width={200}>
            <Menu.Target>
              <Button
                variant="default"
                size="sm"
                leftSection={<Rows3 size={15} />}
                rightSection={<ChevronDown size={14} />}
              >
                Group by {GROUP_LABEL[groupBy]}
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              {GROUPS.map((g) => (
                <Menu.Item key={g} onClick={() => onGroupBy(g)} rightSection={g === groupBy ? <Check size={14} /> : null}>
                  {GROUP_LABEL[g]}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        )}
      </div>
      {filtersActive && (
        <div className={classes.activeFilters} aria-label="Active task filters">
          <span className={classes.activeFiltersLabel}>Showing</span>
          {query.trim() && (
            <UnstyledButton
              className={classes.filterChip}
              title={query.trim()}
              aria-label={`Remove search filter: ${query.trim()}`}
              onClick={() => onQuery("")}
            >
              <span className={classes.filterChipText}>Search: {query.trim()}</span>
              <X size={13} />
            </UnstyledButton>
          )}
          {[...people].map((id) => {
            const member = members.find((item) => item.userId === id);
            const label = id === "__none" ? "Unassigned" : member?.name || member?.email || "Former member";
            return (
              <UnstyledButton
                key={id}
                className={classes.filterChip}
                aria-label={`Remove ${label} filter`}
                onClick={() => onRemovePerson(id)}
              >
                <span className={classes.filterChipText}>{label}</span>
                <X size={13} />
              </UnstyledButton>
            );
          })}
          {dueFilter !== "all" && (
            <UnstyledButton
              className={classes.filterChip}
              onClick={() => onDueFilter("all")}
              aria-label={`Remove ${dueFilterLabel(dueFilter)} filter`}
            >
              <span className={classes.filterChipText}>{dueFilterLabel(dueFilter)}</span>
              <X size={13} />
            </UnstyledButton>
          )}
          <UnstyledButton className={classes.clearFilters} onClick={onClearFilters}>
            Clear all
          </UnstyledButton>
        </div>
      )}
    </div>
  );
}
