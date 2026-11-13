import { useState } from "react";
import { Button } from "@mantine/core";
import { longDate } from "@/shared/lib/format";
import { metricValue, primaryOf } from "../../lib/format";
import { outcomeOf } from "../../lib/outcome";
import { SECTION_HELP } from "../../lib/help";
import type { ActionDraft, OpportunityDetail } from "../../types";
import { RecordActionModal } from "./RecordActionModal";
import { Panel } from "./Panel";
import classes from "../Opportunity.module.css";

function Recorded({ opportunity }: { opportunity: OpportunityDetail }) {
  const action = opportunity.action!;
  const result = outcomeOf(action);
  return (
    <>
      <p className={classes.body}>{action.description}</p>
      <span className={classes.byline}>
        {action.by?.name ?? "Someone"} · live from {longDate(action.startedAt)}
      </span>
      {result.state === "waiting" ? (
        <p className={classes.panelHint}>
          Measuring “{action.metricLabel}” for {action.followUpDays} days after the change. First result around {longDate(result.endsAt)}.
          Starting point: {metricValue(action.unit, action.baseline)}.
        </p>
      ) : (
        <>
          <div className={classes.outcome}>
            <div>
              <div className={classes.outcomeValue}>{result.before}</div>
              <div className={classes.outcomeLabel}>Before</div>
            </div>
            <div>
              <div className={classes.outcomeValue}>{result.after}</div>
              <div className={classes.outcomeLabel}>After</div>
            </div>
            <div>
              <div className={classes.outcomeValue} data-dir={result.dir}>
                {result.change}
              </div>
              <div className={classes.outcomeLabel}>Observed change</div>
            </div>
          </div>
          <p className={classes.panelHint}>
            {action.metricLabel}. This shows what changed after your action, not proof that the action caused it.
          </p>
        </>
      )}
      {action.otherChanges && <p className={classes.panelHint}>Also changed at the time: {action.otherChanges}</p>}
    </>
  );
}

export function OutcomePanel({
  opportunity,
  canEdit,
  busy,
  onRecord,
}: {
  opportunity: OpportunityDetail;
  canEdit: boolean;
  busy: boolean;
  onRecord: (draft: ActionDraft) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const metric = primaryOf(opportunity);

  return (
    <Panel id="radar-outcome" title="Did it help?" help={SECTION_HELP.outcome}>
      {opportunity.action ? (
        <Recorded opportunity={opportunity} />
      ) : (
        <p className={classes.panelHint}>
          Made a change? Record it, and Growth Radar compares “{metric?.label ?? "this measure"}” before and after.
        </p>
      )}
      {canEdit && metric && (
        <Button variant="default" size="xs" onClick={() => setOpen(true)}>
          {opportunity.action ? "Record a new change" : "Record what you changed"}
        </Button>
      )}
      {metric && (
        <RecordActionModal
          key={String(open)}
          opened={open}
          busy={busy}
          metricLabel={metric.label}
          followUpDays={opportunity.period.days}
          onClose={() => setOpen(false)}
          onSave={async (draft) => {
            if (await onRecord(draft)) setOpen(false);
          }}
        />
      )}
    </Panel>
  );
}
