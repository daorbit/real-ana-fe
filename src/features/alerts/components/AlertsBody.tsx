import { useAlertDraft } from "@/features/alerts/hooks/useAlertDraft";
import { RULE_ORDER } from "@/features/alerts/lib/alertMeta";
import type { AlertsOverview } from "@/features/alerts/types";
import { AlertsSummary } from "@/features/alerts/components/AlertsSummary";
import { RuleRow } from "@/features/alerts/components/RuleRow";
import { ChannelsCard } from "@/features/alerts/components/ChannelsCard";
import { HistoryCard } from "@/features/alerts/components/HistoryCard";
import classes from "@/features/alerts/components/Alerts.module.css";

export function AlertsBody({
  workspaceId,
  overview,
  canEdit,
  goalsOn,
}: {
  workspaceId: string | undefined;
  overview: AlertsOverview;
  canEdit: boolean;
  goalsOn: boolean;
}) {
  const { draft, setRule, setChannel } = useAlertDraft(workspaceId, overview);
  if (!draft) return null;

  return (
    <>
      <AlertsSummary overview={overview} />
      <div className={classes.layout}>
        <section className={classes.card}>
          <div className={classes.cardHead}>
            <div>
              <h3 className={classes.cardTitle}>What to watch</h3>
              <div className={classes.cardSub}>Each alert fires once when something starts, then waits until it clears.</div>
            </div>
          </div>
          {RULE_ORDER.map((rule) => (
            <RuleRow
              key={rule}
              rule={rule}
              config={draft.rules[rule]}
              canEdit={canEdit}
              goalsOn={goalsOn}
              onChange={(patch) => setRule(rule, patch)}
            />
          ))}
        </section>
        <div className={classes.side}>
          <ChannelsCard channels={draft.channels} status={overview.channels} canEdit={canEdit} onChange={setChannel} />
          <HistoryCard history={overview.history} />
        </div>
      </div>
    </>
  );
}
