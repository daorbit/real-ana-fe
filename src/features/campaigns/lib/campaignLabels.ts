import type { CampaignInput, CampaignStatus } from "@/features/campaigns/types";

export const STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: "Draft",
  preparing: "Preparing",
  sending: "Sending",
  paused: "Paused",
  sent: "Sent",
};

export const STATUS_COLOR: Record<CampaignStatus, string> = {
  draft: "gray",
  preparing: "blue",
  sending: "blue",
  paused: "orange",
  sent: "teal",
};

export const EMPTY_DRAFT: CampaignInput = {
  name: "",
  subject: "",
  body: "Hi {{name}},\n\n",
  ctaLabel: "",
  ctaUrl: "",
  senderAddress: "",
  formIds: [],
  imported: [],
};
