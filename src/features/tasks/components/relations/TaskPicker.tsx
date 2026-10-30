import { Select } from "@mantine/core";
import { Plus } from "lucide-react";
import { taskOption } from "../../lib/relations";
import type { Task } from "../../types";
import classes from "../Tasks.module.css";

export function TaskPicker({
  candidates,
  placeholder,
  onPick,
}: {
  candidates: Task[];
  placeholder: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className={classes.checkItem}>
      <span className={classes.pickerIcon} aria-hidden>
        <Plus size={16} />
      </span>
      <Select
        className={classes.taskPicker}
        classNames={{ input: classes.bareInput }}
        variant="unstyled"
        searchable
        clearable={false}
        value={null}
        placeholder={placeholder}
        nothingFoundMessage="No matching tasks"
        data={candidates.map(taskOption)}
        onChange={(id) => id && onPick(id)}
        comboboxProps={{ position: "bottom-start", width: "target", withinPortal: true }}
        aria-label={placeholder}
      />
    </div>
  );
}
