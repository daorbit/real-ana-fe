import { useState } from "react";
import { DatePicker } from "@mantine/dates";
import { CalendarDays } from "lucide-react";
import { formatDate } from "@/shared/lib";
import { PopoverPanel } from "./PopoverPanel";
import classes from "./List.module.css";

function label(value: string): string {
  if (!value) return "Add release date";
  return formatDate(new Date(`${value}T00:00:00`), { day: "numeric", month: "short", year: "numeric" });
}

export function DateChip({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <PopoverPanel
      opened={open}
      onChange={setOpen}
      width={280}
      position="bottom-start"
      target={
        <button type="button" className={classes.chip} data-empty={!value || undefined} onClick={() => setOpen((o) => !o)}>
          <CalendarDays size={13} />
          {label(value)}
        </button>
      }
    >
      <div className={classes.calendar}>
        <DatePicker
          size="sm"
          value={value || null}
          onChange={(next) => {
            onChange(next ?? "");
            setOpen(false);
          }}
          classNames={{ day: classes.day }}
        />
        {value && (
          <button
            type="button"
            className={classes.clear}
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            Remove date
          </button>
        )}
      </div>
    </PopoverPanel>
  );
}
