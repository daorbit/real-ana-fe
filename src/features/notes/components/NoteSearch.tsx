import { UnstyledButton } from "@mantine/core";
import { Search, X } from "lucide-react";
import classes from "@/features/notes/components/Notes.module.css";

export function NoteSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className={classes.search}>
      <Search size={14} className={classes.searchIcon} aria-hidden="true" />
      <input
        className={classes.searchInput}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && value) {
            e.stopPropagation();
            onChange("");
          }
        }}
        placeholder="Search"
        aria-label="Search notes"
      />
      {value && (
        <UnstyledButton className={classes.searchClear} onClick={() => onChange("")} aria-label="Clear search">
          <X size={10} strokeWidth={3} />
        </UnstyledButton>
      )}
    </label>
  );
}
