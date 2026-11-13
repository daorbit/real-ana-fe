import { Tooltip } from "@mantine/core";
import { TipText } from "@/shared/ui/InfoTip";
import { metricChange, metricValue, periodLabel, previousPeriodLabel } from "../../lib/format";
import { SOURCE_LABEL } from "../../lib/labels";
import { METRIC_HELP, SECTION_HELP, SOURCE_HELP } from "../../lib/help";
import type { OpportunityDetail } from "../../types";
import { Panel } from "./Panel";
import classes from "../Opportunity.module.css";

export function EvidencePanel({ opportunity }: { opportunity: OpportunityDetail }) {
  const { period, metrics, primaryMetric } = opportunity;
  const previous = previousPeriodLabel(period);

  return (
    <Panel id="radar-evidence" title="Evidence" help={SECTION_HELP.evidence}>
      <div className={classes.evidence} role="table" aria-label="Measured values">
        <div className={classes.evidenceRow} data-head role="row">
          <span role="columnheader">Measure</span>
          <span className={classes.num} role="columnheader">
            {periodLabel(period)}
          </span>
          <span className={classes.num} role="columnheader">
            {previous ?? "Before"}
          </span>
          <span className={classes.num} role="columnheader">
            <TipText label={SECTION_HELP.change}>Change</TipText>
          </span>
        </div>
        {metrics.map((metric) => {
          const change = metricChange(metric);
          const help = METRIC_HELP[metric.key];
          return (
            <div key={metric.key} className={classes.evidenceRow} data-primary={metric.key === primaryMetric || undefined} role="row">
              <span className={classes.metricName} role="cell">
                {help ? <TipText label={help}>{metric.label}</TipText> : metric.label}
              </span>
              <span className={classes.num} role="cell">
                {metricValue(metric.unit, metric.current)}
              </span>
              <span className={classes.num} role="cell">
                {metric.previous === null ? "–" : metricValue(metric.unit, metric.previous)}
              </span>
              <span className={classes.change} data-dir={change?.dir} role="cell">
                {change?.text ?? "–"}
              </span>
            </div>
          );
        })}
      </div>
      <div className={classes.facts}>
        <Tooltip label={period.includesToday ? "The latest period includes today, which is not over yet." : "Only full days are compared, so a half-finished day never looks like a drop."} multiline w={260} withArrow>
          <span className={classes.fact}>
            {period.days}-day periods{period.includesToday ? ", today included" : ""}
          </span>
        </Tooltip>
        <Tooltip label="How many visits, views or impressions the finding is based on. Bigger samples are more reliable." multiline w={260} withArrow>
          <span className={classes.fact}>Based on {opportunity.sampleSize.toLocaleString()}</span>
        </Tooltip>
        {opportunity.sources.map((source) => (
          <Tooltip key={source} label={SOURCE_HELP[source]} multiline w={260} withArrow>
            <span className={classes.fact}>{SOURCE_LABEL[source]}</span>
          </Tooltip>
        ))}
        <Tooltip label="The version of the rule that produced this finding. It changes when we improve the check." multiline w={260} withArrow>
          <span className={classes.fact}>Check v{opportunity.detectorVersion}</span>
        </Tooltip>
      </div>
    </Panel>
  );
}
