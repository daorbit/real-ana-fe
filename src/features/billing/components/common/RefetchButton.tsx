import { RefreshButton } from "@/shared/ui/Refresh";

export function RefetchButton({
  label,
  loading,
  onClick,
}: {
  label: string;
  loading: boolean;
  onClick: () => void;
}) {
  return <RefreshButton hint={label} label={label} refreshing={loading} onRefresh={onClick} />;
}
