import { CalendarClock, Plus, Share2 } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";

export function PostsEmptyState({
  connected,
  onCreate,
  onConnect,
}: {
  connected: boolean;
  onCreate: () => void;
  onConnect?: () => void;
}) {
  if (!connected) {
    return (
      <EmptyState
        icon={Share2}
        title="Connect an account to get started"
        description="Link LinkedIn or Instagram and Quantalog can publish scheduled posts for you — once, or on a repeating schedule."
        action={{
          label: "Connect LinkedIn or Instagram",
          icon: Share2,
          to: "/app/settings?tab=connections",
          onClick: onConnect,
        }}
      />
    );
  }

  return (
    <EmptyState
      icon={CalendarClock}
      title="Nothing scheduled yet"
      description="Write a post, pick a date and time, and Quantalog publishes it for you — once, or on a repeating schedule."
      action={{ label: "Schedule your first post", icon: Plus, onClick: onCreate }}
    />
  );
}
