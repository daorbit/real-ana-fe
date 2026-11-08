import { shortDate } from "@/shared/lib/format";
import type { Campaign } from "@/features/campaigns/types";

export function campaignHref(campaign: Campaign): string {
  return campaign.status === "draft" ? `/app/campaigns/${campaign.id}/edit` : `/app/campaigns/${campaign.id}`;
}

export function isInProgress(campaign: Campaign): boolean {
  return campaign.status === "sending" || campaign.status === "paused" || campaign.status === "preparing";
}

export function campaignMeta(campaign: Campaign): string {
  const { sent, total } = campaign.counts;
  if (campaign.status === "draft") return `Edited ${shortDate(campaign.updatedAt)}`;
  if (campaign.status === "sent") return `${sent.toLocaleString()} sent · ${shortDate(campaign.finishedAt ?? campaign.startedAt ?? campaign.updatedAt)}`;
  return `${sent.toLocaleString()} of ${total.toLocaleString()} sent`;
}

export function sentShare(campaign: Campaign): number {
  const { sent, failed, total } = campaign.counts;
  return total ? Math.min(100, ((sent + failed) / total) * 100) : 0;
}
