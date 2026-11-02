import { RefreshButton } from "@/shared/ui/Refresh";

export function AdminRefreshButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return <RefreshButton hint="Refresh" refreshing={loading} onRefresh={onClick} />;
}
