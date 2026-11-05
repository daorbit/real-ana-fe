import { Link } from "react-router-dom";
import { shortDate } from "@/shared/lib/format";
import type { Campaign } from "@/features/campaigns/types";
import { CampaignStatusBadge } from "./CampaignStatusBadge";
import classes from "./Campaigns.module.css";

function summaryOf(campaign: Campaign): string {
  if (campaign.status === "draft") return campaign.subject || "No subject yet";
  return `${campaign.counts.sent.toLocaleString()} of ${campaign.counts.total.toLocaleString()} sent`;
}

export function CampaignRow({ campaign }: { campaign: Campaign }) {
  const to = campaign.status === "draft" ? `/app/campaigns/${campaign.id}/edit` : `/app/campaigns/${campaign.id}`;
  const when = campaign.startedAt ? `Sent ${shortDate(campaign.startedAt)}` : `Created ${shortDate(campaign.createdAt)}`;
  return (
    <Link to={to} className={classes.row}>
      <div>
        <div className={classes.rowName}>{campaign.name}</div>
        <div className={classes.rowMeta}>{summaryOf(campaign)}</div>
      </div>
      <div className={classes.rowSide}>
        <span>{when}</span>
        <CampaignStatusBadge status={campaign.status} />
      </div>
    </Link>
  );
}
