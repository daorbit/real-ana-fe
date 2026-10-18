import { useEffect, useRef } from "react";
import { CloseButton, SegmentedControl, Select, TextInput } from "@mantine/core";
import { LayoutGrid, Search } from "lucide-react";
import { ALL_CATEGORIES, type ConnectionFilter, type StatusFilter } from "../../lib/filter";
import classes from "./ConnectionsToolbar.module.css";

const STATUS_LABELS: { value: StatusFilter; label: string; short: string }[] = [
  { value: "all", label: "All", short: "All" },
  { value: "connected", label: "Connected", short: "On" },
  { value: "attention", label: "Needs attention", short: "Issues" },
  { value: "available", label: "Not connected", short: "Off" },
];

interface Props {
  filter: ConnectionFilter;
  counts?: Record<StatusFilter, number>;
  categories: string[];
  onChange: (filter: ConnectionFilter) => void;
}

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return Boolean(el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)));
}

export function ConnectionsToolbar({ filter, counts, categories, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || isTyping(event.target)) return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={classes.toolbar}>
      <TextInput
        ref={inputRef}
        className={classes.search}
        placeholder="Search apps and accounts"
        aria-label="Search connections"
        leftSection={<Search size={16} />}
        value={filter.query}
        onChange={(e) => onChange({ ...filter, query: e.currentTarget.value })}
        onKeyDown={(e) => {
          if (e.key === "Escape") onChange({ ...filter, query: "" });
          if (e.key === "Enter") e.preventDefault();
        }}
        rightSection={
          filter.query ? (
            <CloseButton size="sm" aria-label="Clear search" onClick={() => onChange({ ...filter, query: "" })} />
          ) : undefined
        }
      />
      <Select
        className={classes.category}
        aria-label="Filter by category"
        leftSection={<LayoutGrid size={15} />}
        value={filter.category}
        allowDeselect={false}
        checkIconPosition="right"
        comboboxProps={{ withinPortal: true }}
        onChange={(value) => onChange({ ...filter, category: value ?? ALL_CATEGORIES })}
        data={[{ value: ALL_CATEGORIES, label: "All categories" }, ...categories.map((c) => ({ value: c, label: c }))]}
      />
      <SegmentedControl
        className={classes.status}
        value={filter.status}
        onChange={(value) => onChange({ ...filter, status: value as StatusFilter })}
        data={STATUS_LABELS.map((option) => ({
          value: option.value,
          label: (
            <span>
              <span className={classes.full}>{option.label}</span>
              <span className={classes.short}>{option.short}</span>
              {counts && <span className={classes.count}>{counts[option.value]}</span>}
            </span>
          ),
        }))}
      />
    </div>
  );
}
