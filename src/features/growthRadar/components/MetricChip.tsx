import { Tooltip } from "@mantine/core";
import { metricChange, metricValue } from "../lib/format";
import { METRIC_HELP } from "../lib/help";
import type { EvidenceMetric } from "../types";
import rows from "./Rows.module.css";

export function MetricChip({ metric }: { metric: EvidenceMetric }) {
  const change = metricChange(metric);
  const help = METRIC_HELP[metric.key];
  return (
    <Tooltip label={help ? `${metric.label}. ${help}` : metric.label} multiline w={260} withArrow>
      <span className={rows.metric}>
        <span className={rows.metricValue}>
          {metric.previous !== null && `${metricValue(metric.unit, metric.previous)} → `}
          {metricValue(metric.unit, metric.current)}
        </span>
        {change && change.dir !== "flat" && (
          <span className={rows.change} data-dir={change.dir}>
            {change.text}
          </span>
        )}
      </span>
    </Tooltip>
  );
}
