import { ActionIcon, Tooltip } from "@mantine/core";
import { Maximize2, Minimize2, X } from "lucide-react";

export function PanelControls({
  expanded,
  onToggleExpand,
  onClose,
}: {
  expanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <Tooltip label={expanded ? "Shrink" : "Expand"} withArrow>
        <ActionIcon variant="subtle" color="gray" radius="md" onClick={onToggleExpand} aria-label={expanded ? "Shrink notes" : "Expand notes"}>
          {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Close" withArrow>
        <ActionIcon variant="subtle" color="gray" radius="md" onClick={onClose} aria-label="Close notes">
          <X size={16} />
        </ActionIcon>
      </Tooltip>
    </>
  );
}
