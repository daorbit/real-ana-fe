import { Progress } from "@mantine/core";
import type { Campaign } from "@/features/campaigns/types";
import classes from "../Campaigns.module.css";

export function CampaignSummary({ campaign }: { campaign: Campaign }) {
  const { total, sent, failed, unsubscribed } = campaign.counts;
  const percent = total ? Math.min(100, ((sent + failed) / total) * 100) : 0;
  const items = [
    { label: "Recipients", value: total },
    { label: "Sent", value: sent },
    { label: "Failed", value: failed },
    { label: "Unsubscribed", value: unsubscribed },
  ];
  return (
    <>
      <div className={classes.summary}>
        {items.map((item) => (
          <div key={item.label} className={classes.summaryItem}>
            <div className={classes.summaryLabel}>{item.label}</div>
            <div className={classes.summaryValue}>{item.value.toLocaleString()}</div>
          </div>
        ))}
      </div>
      {campaign.status !== "sent" && <Progress value={percent} size="sm" mt="md" color="var(--accent)" aria-label="Emails sent so far" />}
    </>
  );
}
