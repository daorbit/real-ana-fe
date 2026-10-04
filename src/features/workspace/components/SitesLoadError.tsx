import { ErrorState } from "@/shared/ui/ErrorState";

export function SitesLoadError({ onRetry, retrying }: { onRetry: () => void; retrying: boolean }) {
  return (
    <ErrorState
      title="Couldn't load your sites"
      description="Your sites are safe — we just couldn't reach them. Check your connection and try again."
      onRetry={onRetry}
      retrying={retrying}
    />
  );
}
