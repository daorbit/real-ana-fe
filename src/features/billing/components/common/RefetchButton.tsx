import { ActionIcon, Tooltip } from "@mantine/core";
import { RefreshCw } from "lucide-react";

export function RefetchButton({
  label,
  loading,
  onClick,
}: {
  label: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip label={label}>
      <ActionIcon variant="default" size={36} radius="md" loading={loading} onClick={onClick} aria-label={label}>
        <RefreshCw size={15} />
      </ActionIcon>
    </Tooltip>
  );
}
