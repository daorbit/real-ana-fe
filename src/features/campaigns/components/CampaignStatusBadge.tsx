import { STATUS_LABEL } from "@/features/campaigns/lib/campaignLabels";
import type { CampaignStatus } from "@/features/campaigns/types";
import classes from "./Campaigns.module.css";

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <span className={classes.status}>
      <span className={classes.statusDot} data-status={status} aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  );
}
