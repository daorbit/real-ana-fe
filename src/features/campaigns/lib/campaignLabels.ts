import type { CampaignStatus } from "@/features/campaigns/types";

export const STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: "Draft",
  preparing: "Preparing",
  sending: "Sending",
  paused: "Paused",
  sent: "Sent",
};
