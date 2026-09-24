import { CloudOff, RotateCw } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";

export function ErrorState({
  title = "Couldn't load this",
  description = "Something went wrong on our side or with your connection. Try again in a moment.",
  onRetry,
  retrying = false,
  compact = false,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retrying?: boolean;
  compact?: boolean;
}) {
  return (
    <EmptyState
      icon={CloudOff}
      title={title}
      description={description}
      compact={compact}
      action={onRetry ? { label: "Try again", icon: RotateCw, onClick: onRetry, loading: retrying } : undefined}
    />
  );
}
