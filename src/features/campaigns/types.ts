export type CampaignStatus = "draft" | "preparing" | "sending" | "paused" | "sent";

export interface CampaignContact {
  email: string;
  name?: string;
}

export interface CampaignInput {
  name: string;
  subject: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  senderAddress: string;
  formIds: string[];
  imported: CampaignContact[];
}

export interface Campaign extends Omit<CampaignInput, "imported"> {
  id: string;
  imported?: CampaignContact[];
  importedCount: number;
  status: CampaignStatus;
  counts: { total: number; sent: number; failed: number; unsubscribed: number };
  lastError: string;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignUsage {
  used: number;
  limit: number;
  plan: string;
}

export interface CampaignsResponse {
  campaigns: Campaign[];
  usage: CampaignUsage;
}

export interface CampaignSources {
  forms: { id: string; title: string; responses: number }[];
  delivery:
    | { connected: false }
    | { connected: true; provider: string; providerName: string; fromEmail: string };
}

export interface CampaignAudience {
  total: number;
  suppressed: number;
  usage: CampaignUsage;
}

export interface CampaignFailure {
  email: string;
  error: string;
}
