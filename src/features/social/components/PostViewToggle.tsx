import { UnstyledButton } from "@mantine/core";
import { CalendarDays, List as ListIcon } from "lucide-react";
import classes from "./SocialQueue.module.css";

export type PostView = "list" | "calendar";

const VIEWS = [
  { value: "list", label: "List", Icon: ListIcon },
  { value: "calendar", label: "Calendar", Icon: CalendarDays },
] as const;

export function PostViewToggle({ view, onChange }: { view: PostView; onChange: (next: PostView) => void }) {
  return (
    <div className={classes.views} role="group" aria-label="View">
      {VIEWS.map(({ value, label, Icon }) => (
        <UnstyledButton
          key={value}
          className={classes.view}
          data-active={view === value || undefined}
          aria-pressed={view === value}
          onClick={() => onChange(value)}
        >
          <Icon size={14} />
          {label}
        </UnstyledButton>
      ))}
    </div>
  );
}
