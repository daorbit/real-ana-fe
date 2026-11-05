import { Anchor, Progress } from "@mantine/core";
import { Link } from "react-router-dom";
import type { CampaignSources, CampaignUsage } from "@/features/campaigns/types";
import classes from "./Campaigns.module.css";

interface Props {
  usage: CampaignUsage | undefined;
  sources: CampaignSources | undefined;
}

export function SendingStrip({ usage, sources }: Props) {
  const percent = usage?.limit ? Math.min(100, (usage.used / usage.limit) * 100) : 0;
  const forms = sources?.forms ?? [];
  const responses = forms.reduce((sum, form) => sum + form.responses, 0);
  const delivery = sources?.delivery;

  return (
    <section aria-label="Your sending at a glance" className={classes.strip}>
      <div className={classes.cell}>
        <div className={classes.cellLabel}>This month</div>
        <div className={classes.cellValue}>
          {(usage?.used ?? 0).toLocaleString()} of {(usage?.limit ?? 0).toLocaleString()} emails
        </div>
        <Progress value={percent} size="xs" mt={10} color="var(--accent)" aria-label="Campaign emails used this month" />
      </div>
      <div className={classes.cell}>
        <div className={classes.cellLabel}>Sending through</div>
        <div className={classes.cellValue}>{delivery?.connected ? delivery.providerName : "No provider active"}</div>
        <Anchor component={Link} to="/app/apps" size="xs">
          {delivery?.connected ? "Change in Apps" : "Activate one in Apps"}
        </Anchor>
      </div>
      <div className={classes.cell}>
        <div className={classes.cellLabel}>People you can email</div>
        <div className={classes.cellValue}>
          {responses.toLocaleString()} from {forms.length} {forms.length === 1 ? "form" : "forms"}
        </div>
        <div className={classes.rowMeta}>Unsubscribed people are always left out</div>
      </div>
    </section>
  );
}
