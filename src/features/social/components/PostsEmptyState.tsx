import { CalendarClock, Plus } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";

export function PostsEmptyState({
  disabled,
  onCreate,
}: {
  disabled: boolean;
  onCreate: () => void;
}) {
  return (
    <EmptyState
      icon={CalendarClock}
      title="Nothing scheduled yet"
      description="Write a post, pick a date and time, and Quantalog publishes it for you — once, or on a repeating schedule."
      action={{ label: "Schedule your first post", icon: Plus, disabled, onClick: onCreate }}
    />
  );
}
