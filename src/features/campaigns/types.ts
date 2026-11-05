export type CampaignStatus = "draft" | "preparing" | "sending" | "paused" | "sent";
export type CampaignMode = "design" | "html";
export type EmailFont = "sans" | "serif" | "rounded" | "mono";
export type EmailAlign = "left" | "center" | "right";

export interface EmailTheme {
  pageColor: string;
  cardColor: string;
  headingColor: string;
  textColor: string;
  mutedColor: string;
  accentColor: string;
  buttonTextColor: string;
  font: EmailFont;
  width: number;
  radius: number;
}

export type EmailBlock =
  | { id: string; type: "brand"; align: EmailAlign }
  | { id: string; type: "heading"; text: string; size: "s" | "m" | "l" | "xl"; align: EmailAlign }
  | { id: string; type: "text"; text: string; size: "s" | "m" | "l"; align: EmailAlign }
  | { id: string; type: "button"; label: string; url: string; align: EmailAlign; fullWidth: boolean }
  | { id: string; type: "image"; url: string; alt: string; link: string; width: number; radius: number }
  | { id: string; type: "divider" }
  | { id: string; type: "spacer"; height: number }
  | { id: string; type: "columns"; leftTitle: string; leftText: string; rightTitle: string; rightText: string };

export type EmailBlockType = EmailBlock["type"];

type WithoutId<T> = T extends unknown ? Omit<T, "id"> : never;

export type EmailBlockDraft = WithoutId<EmailBlock>;

export interface EmailDesign {
  theme: EmailTheme;
  blocks: EmailBlock[];
}

export interface CampaignContact {
  email: string;
  name?: string;
}

export interface CampaignInput {
  name: string;
  subject: string;
  preheader: string;
  mode: CampaignMode;
  design: EmailDesign;
  html: string;
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
