export type AlertRule = "trafficDrop" | "trafficSpike" | "trackingStopped" | "goalBehind" | "formsQuiet";

export type AlertChannel = "email" | "telegram" | "whatsapp";

export type RuleConfig = { enabled: boolean; value: number };

export type AlertConfig = {
  rules: Record<AlertRule, RuleConfig>;
  channels: Record<AlertChannel, boolean>;
};

export type AlertHistoryItem = {
  id: string;
  rule: AlertRule;
  title: string;
  summary: string;
  link: string;
  createdAt: string;
};

export type AlertChannelStatus = {
  email: { available: boolean };
  telegram: { available: boolean; chats: number };
  whatsapp: { available: boolean; entitled: boolean; numbers: number };
};

export type AlertIncident = AlertHistoryItem & { since: string };

export type AlertDay = { day: string; count: number };

export type AlertsOverview = {
  config: AlertConfig;
  checkEveryHours: number;
  lastCheckedAt: string | null;
  nextCheckAt: string | null;
  ongoing: number;
  sitesWatched: number;
  incidents: AlertIncident[];
  daily: AlertDay[];
  history: AlertHistoryItem[];
  channels: AlertChannelStatus;
};

export type ChannelOutcome = { sent: number; failed: number; skipped?: string };

export type AlertTestReport = Partial<Record<AlertChannel | "inApp", ChannelOutcome>>;
