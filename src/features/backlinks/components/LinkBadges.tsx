import { Badge, Tooltip } from "@mantine/core";
import type { BacklinkStatus, LinkRel } from "../types";
import { REL_META, STATUS_META } from "../utils/labels";

export function StatusBadge({ status, error }: { status: BacklinkStatus; error?: string }) {
  const meta = STATUS_META[status];
  return (
    <Tooltip label={error ? `${meta.hint} ${error}` : meta.hint} withArrow multiline w={240}>
      <Badge size="sm" variant="light" color={meta.color} radius="sm">
        {meta.label}
      </Badge>
    </Tooltip>
  );
}

export function RelBadge({ rel }: { rel: LinkRel }) {
  const meta = REL_META[rel];
  return (
    <Tooltip label={meta.hint} withArrow multiline w={220}>
      <Badge size="sm" variant="outline" color={meta.color} radius="sm">
        {meta.label}
      </Badge>
    </Tooltip>
  );
}
