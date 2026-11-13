import { TipText } from "@/shared/ui/InfoTip";
import { FACTOR_LABEL, LEVEL_LABEL } from "../../lib/labels";
import { FACTOR_HELP, PRIORITY_GROUP_HELP } from "../../lib/help";
import type { Factors, Level } from "../../types";
import { PriorityLabel } from "../PriorityLabel";
import { Panel } from "./Panel";
import classes from "../Opportunity.module.css";

const ORDER = ["impact", "confidence", "urgency", "effort"] as const;

export function FactorList({ priority, factors }: { priority: Level; factors: Factors }) {
  return (
    <Panel id="radar-priority" title="Why this priority" help={PRIORITY_GROUP_HELP} aside={<PriorityLabel level={priority} />}>
      <div className={classes.factors}>
        {ORDER.map((key) => (
          <div key={key} className={classes.factor}>
            <div className={classes.factorHead}>
              <TipText label={FACTOR_HELP[key]}>{FACTOR_LABEL[key]}</TipText>
              <span className={classes.factorLevel} data-level={factors[key].level}>
                {LEVEL_LABEL[factors[key].level]}
              </span>
            </div>
            <span className={classes.factorReason}>{factors[key].reason}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
