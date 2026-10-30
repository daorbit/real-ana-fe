import { FilterChips } from "@/shared/ui/FilterChips";
import { countOpen, type BoardColumn } from "../lib/board";
import type { Task } from "../types";
import classes from "./Tasks.module.css";

export function ColumnPicker({
  columns,
  items,
  taskMap,
  splitCompleted,
  value,
  onChange,
}: {
  columns: BoardColumn[];
  items: Record<string, string[]>;
  taskMap: Map<string, Task>;
  splitCompleted: boolean;
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className={classes.columnPicker}>
      <FilterChips
        ariaLabel="Board columns"
        value={value}
        onChange={onChange}
        data={columns.map((column) => ({
          value: column.key,
          label: column.title,
          count: String(countOpen(items[column.key] ?? [], taskMap, splitCompleted)),
        }))}
      />
    </div>
  );
}
