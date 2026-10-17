import { Button } from "@mantine/core";
import { RefreshCw } from "lucide-react";

export function AdminRefreshButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <Button variant="default" size="sm" radius="md" leftSection={<RefreshCw size={14} />} loading={loading} onClick={onClick}>
      Refresh
    </Button>
  );
}
