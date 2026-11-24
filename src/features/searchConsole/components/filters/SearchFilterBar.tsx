import { UnstyledButton } from "@mantine/core";
import { Chip } from "@/shared/ui/Chip";
import type { SearchType } from "@/shared/types";
import { filterLabel } from "../../searchFilters";
import type { SearchFiltersState } from "../../useSearchFilters";
import { SearchFilterPopover } from "./SearchFilterPopover";
import layout from "../searchConsole.module.css";
import classes from "./filters.module.css";

const MAX_FILTERS = 8;

export function SearchFilterBar({ state, type }: { state: SearchFiltersState; type: SearchType }) {
  const { filters, add, remove, clear } = state;

  return (
    <div className={classes.bar} role="group" aria-label="Search filters">
      <SearchFilterPopover type={type} onAdd={add} disabled={filters.length >= MAX_FILTERS} />
      {filters.map((filter) => (
        <Chip
          key={`${filter.dimension}-${filter.operator}-${filter.expression}`}
          active
          removable
          title="Remove this filter"
          onClick={() => remove(filter)}
        >
          {filterLabel(filter)}
        </Chip>
      ))}
      {filters.length > 1 && (
        <UnstyledButton className={layout.textLink} onClick={clear}>
          Clear all
        </UnstyledButton>
      )}
    </div>
  );
}
