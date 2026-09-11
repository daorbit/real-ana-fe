import { ActionIcon, Badge, Group, Text, Tooltip } from "@mantine/core";
import { X } from "lucide-react";
import classes from "./MediaPreviewModal.module.css";

interface Props {
  title: string;
  /** Kind, size and dimensions — the facts worth reading without opening the panel. */
  meta: string[];
  onClose: () => void;
}

/** The preview's chrome: what is on the stage, and the way out. */
export function PreviewTopbar({ title, meta, onClose }: Props) {
  return (
    <Group justify="space-between" className={classes.topbar} wrap="nowrap">
      <Group gap={10} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
        <Text fw={600} size="sm" truncate className={classes.topbarTitle} title={title}>
          {title}
        </Text>
        {meta.map((m) => (
          <Badge key={m} variant="light" color="gray" size="sm" visibleFrom="md">
            {m}
          </Badge>
        ))}
      </Group>

      <Tooltip label="Close preview" withArrow>
        <ActionIcon variant="subtle" color="gray" size="lg" onClick={onClose} aria-label="Close">
          <X size={19} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
