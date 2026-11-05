import type { Campaign, CampaignsResponse } from "@/features/campaigns/types";
import { draftFromTemplate, CAMPAIGN_TEMPLATES } from "@/features/campaigns/lib/campaignTemplates";

const DAY_MS = 24 * 60 * 60 * 1000;
const SAMPLE_ADDRESS = "12 Market Street, Bengaluru";

function daysAgo(days: number): string {
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

function campaigns(): Campaign[] {
  const launch = draftFromTemplate(CAMPAIGN_TEMPLATES[0], SAMPLE_ADDRESS);
  const event = draftFromTemplate(CAMPAIGN_TEMPLATES[3], SAMPLE_ADDRESS);
  return [
    {
      ...launch,
      id: "demo-campaign-launch",
      name: "Spring product launch",
      subject: "Our new plans are here",
      importedCount: 0,
      status: "sent",
      counts: { total: 1240, sent: 1228, failed: 12, unsubscribed: 9 },
      lastError: "",
      startedAt: daysAgo(6),
      finishedAt: daysAgo(6),
      createdAt: daysAgo(8),
      updatedAt: daysAgo(6),
    },
    {
      ...event,
      id: "demo-campaign-webinar",
      name: "Webinar invite",
      subject: "Join our live growth session",
      importedCount: 0,
      status: "draft",
      counts: { total: 0, sent: 0, failed: 0, unsubscribed: 0 },
      lastError: "",
      startedAt: null,
      finishedAt: null,
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
  ];
}

export function demoCampaigns(): CampaignsResponse {
  return { campaigns: campaigns(), usage: { used: 1240, limit: 5000, plan: "Starter" } };
}

export function demoCampaign(id: string): Campaign | null {
  return campaigns().find((campaign) => campaign.id === id) ?? null;
}
