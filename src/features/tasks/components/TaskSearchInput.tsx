import { TextInput, type TextInputProps } from "@mantine/core";
import { Search } from "lucide-react";
import classes from "./Tasks.module.css";

export function TaskSearchInput({
  query,
  onQuery,
  ...rest
}: { query: string; onQuery: (value: string) => void } & Pick<TextInputProps, "className" | "visibleFrom" | "hiddenFrom">) {
  return (
    <TextInput
      {...rest}
      classNames={{ input: classes.searchInput }}
      size="sm"
      leftSection={<Search size={15} />}
      placeholder="Search tasks or T-12"
      value={query}
      onChange={(e) => onQuery(e.currentTarget.value)}
      aria-label="Search tasks"
    />
  );
}
