import { ActionIcon, Tooltip } from "@mantine/core";
import { Minus, Plus, RotateCcw } from "lucide-react";

export function ZoomControls({
  canZoomIn,
  canZoomOut,
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  canZoomIn: boolean;
  canZoomOut: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) {
  return (
    <ActionIcon.Group orientation="vertical" className="world-map-zoom">
      <Tooltip label="Zoom in" position="left" withArrow>
        <ActionIcon variant="default" size="md" onClick={onZoomIn} disabled={!canZoomIn} aria-label="Zoom in">
          <Plus size={14} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Zoom out" position="left" withArrow>
        <ActionIcon variant="default" size="md" onClick={onZoomOut} disabled={!canZoomOut} aria-label="Zoom out">
          <Minus size={14} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Reset view" position="left" withArrow>
        <ActionIcon variant="default" size="md" onClick={onReset} disabled={!canZoomOut} aria-label="Reset view">
          <RotateCcw size={13} />
        </ActionIcon>
      </Tooltip>
    </ActionIcon.Group>
  );
}
