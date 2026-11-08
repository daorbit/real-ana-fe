import { Progress } from "@mantine/core";
import { Code2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toneOfTheme } from "@/features/campaigns/lib/campaignTemplates";
import { campaignHref, campaignMeta, isInProgress, sentShare } from "@/features/campaigns/lib/campaignStatus";
import type { Campaign } from "@/features/campaigns/types";
import { CampaignMenu } from "./CampaignMenu";
import { CampaignStatusBadge } from "./CampaignStatusBadge";
import { EmailThumb } from "./TemplateThumb";
import classes from "./CampaignCard.module.css";

export function CampaignPreview({ campaign, tall = false }: { campaign: Campaign; tall?: boolean }) {
  return (
    <span className={classes.preview} data-tall={tall || undefined}>
      {campaign.mode === "html" ? (
        <span className={classes.html}>
          <Code2 size={22} aria-hidden />
          Custom HTML
        </span>
      ) : (
        <EmailThumb tone={toneOfTheme(campaign.design.theme)} blocks={campaign.design.blocks} className={classes.thumb} />
      )}
    </span>
  );
}

export function CampaignCard({
  campaign,
  onDelete,
}: {
  campaign: Campaign;
  onDelete?: (campaign: Campaign) => void;
}) {
  const to = campaignHref(campaign);
  const showProgress = isInProgress(campaign) && campaign.counts.total > 0;

  return (
    <article className={classes.card}>
      <Link to={to} className={classes.link}>
        <CampaignPreview campaign={campaign} />
        <span className={classes.body}>
          <span className={classes.name}>{campaign.name}</span>
          <span className={classes.subject}>{campaign.subject || "No subject yet"}</span>
        </span>
      </Link>
      {showProgress && (
        <Progress value={sentShare(campaign)} size="xs" color="var(--accent)" className={classes.progress} aria-label="Emails sent so far" />
      )}
      <div className={classes.foot}>
        <CampaignStatusBadge status={campaign.status} />
        <span className={classes.meta}>{campaignMeta(campaign)}</span>
        {onDelete && <CampaignMenu campaign={campaign} to={to} onDelete={onDelete} />}
      </div>
    </article>
  );
}
