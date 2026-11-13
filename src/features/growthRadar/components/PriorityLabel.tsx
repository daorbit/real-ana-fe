import { Tooltip } from "@mantine/core";
import { LEVEL_LABEL } from "../lib/labels";
import { PRIORITY_HELP } from "../lib/help";
import type { Level } from "../types";
import rows from "./Rows.module.css";

export function PriorityLabel({ level, reason }: { level: Level; reason?: string }) {
  return (
    <Tooltip label={reason || PRIORITY_HELP[level]} multiline w={280} withArrow>
      <span className={rows.priority} data-level={level}>
        {LEVEL_LABEL[level]} priority
      </span>
    </Tooltip>
  );
}
