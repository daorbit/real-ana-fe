import { Progress } from "@mantine/core";
import { Link } from "react-router-dom";
import { shortDate } from "@/shared/lib/format";
import type { Campaign } from "@/features/campaigns/types";
import { CampaignStatusBadge } from "./CampaignStatusBadge";
import classes from "./Campaigns.module.css";

function resultOf(campaign: Campaign): string {
  if (campaign.status === "draft") return "Not sent";
  if (campaign.status === "sent") return `${campaign.counts.sent.toLocaleString()} sent`;
  return `${campaign.counts.sent.toLocaleString()} of ${campaign.counts.total.toLocaleString()}`;
}

function whenOf(campaign: Campaign): string {
  if (campaign.startedAt) return `Sent ${shortDate(campaign.startedAt)}`;
  return `Edited ${shortDate(campaign.updatedAt)}`;
}

export function CampaignRow({ campaign }: { campaign: Campaign }) {
  const to = campaign.status === "draft" ? `/app/campaigns/${campaign.id}/edit` : `/app/campaigns/${campaign.id}`;
  const { sent, failed, total } = campaign.counts;
  const inProgress = campaign.status === "sending" || campaign.status === "paused" || campaign.status === "preparing";
  return (
    <Link to={to} className={classes.row}>
      <div className={classes.rowMain}>
        <div className={classes.rowName}>{campaign.name}</div>
        <div className={classes.rowMeta}>{campaign.subject || "No subject yet"}</div>
        {inProgress && total > 0 && (
          <Progress value={((sent + failed) / total) * 100} size="xs" mt={8} color="var(--accent)" aria-label="Emails sent so far" />
        )}
      </div>
      <div className={classes.rowResult}>
        <span className={classes.rowResultValue}>{resultOf(campaign)}</span>
        <span className={classes.rowMeta}>{whenOf(campaign)}</span>
      </div>
      <CampaignStatusBadge status={campaign.status} />
    </Link>
  );
}
