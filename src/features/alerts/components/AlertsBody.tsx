import { useAlertDraft } from "@/features/alerts/hooks/useAlertDraft";
import { RULE_ORDER } from "@/features/alerts/lib/alertMeta";
import type { AlertsOverview } from "@/features/alerts/types";
import { AlertsHero } from "@/features/alerts/components/AlertsHero";
import { IncidentsCard } from "@/features/alerts/components/IncidentsCard";
import { RuleCard } from "@/features/alerts/components/RuleCard";
import { ChannelsCard } from "@/features/alerts/components/ChannelsCard";
import { AlertTimeline } from "@/features/alerts/components/AlertTimeline";
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

  const enabled = RULE_ORDER.filter((rule) => draft.rules[rule].enabled).length;

  return (
    <>
      <AlertsHero overview={overview} />
      <IncidentsCard incidents={overview.incidents} />
      <div className={classes.layout}>
        <section className={classes.card}>
          <div className={classes.cardHead}>
            <div>
              <h3 className={classes.cardTitle}>What to watch</h3>
              <div className={classes.cardSub}>
                {enabled} of {RULE_ORDER.length} on. Each fires once when something starts, then waits until it clears.
              </div>
            </div>
          </div>
          <div className={classes.ruleGrid}>
            {RULE_ORDER.map((rule) => (
              <RuleCard
                key={rule}
                rule={rule}
                config={draft.rules[rule]}
                canEdit={canEdit}
                goalsOn={goalsOn}
                onChange={(patch) => setRule(rule, patch)}
              />
            ))}
          </div>
        </section>
        <div className={classes.side}>
          <ChannelsCard channels={draft.channels} status={overview.channels} canEdit={canEdit} onChange={setChannel} />
          <AlertTimeline history={overview.history} />
        </div>
      </div>
    </>
  );
}
