import type {
  CalendarStatus,
  FormsApp,
  IntegrationCategory,
  IntegrationTile,
  PaymentProvider,
  PaymentSettings,
  SheetsStatus,
} from "../types";
import type { TelegramStatus, WhatsAppStatus } from "@/shared/types";

export const CATEGORY_ORDER: IntegrationCategory[] = [
  "email",
  "payments",
  "scheduling",
  "notification",
  "crm",
  "automation",
];

export const CATEGORY_TITLE: Record<IntegrationCategory, string> = {
  quantalog: "Quantalog apps",
  ai: "AI assistants",
  search: "Search & SEO",
  email: "Email delivery",
  payments: "Payments",
  scheduling: "Scheduling",
  notification: "Notifications",
  crm: "CRM",
  automation: "Automation",
};

export const CATEGORY_HINT: Record<IntegrationCategory, string> = {
  quantalog: "Official Quantalog modules. Turn one on and it appears for everyone in this workspace.",
  ai: "Let Claude or ChatGPT read this workspace's forms, leads, bookings and traffic, read-only.",
  search: "Google data behind your Search visibility reports.",
  email: "Where your form notification emails are sent from. One provider is active at a time.",
  payments: "Gateways your forms can charge through. Keys stay encrypted on the server.",
  scheduling: "Calendars your booking fields check for busy times and add events to.",
  notification: "Channels a new form response is announced in.",
  crm: "Tools a response can be copied into.",
  automation: "Send each submission on to spreadsheets and your own systems.",
};

export const PAYMENT_PROVIDERS: { id: PaymentProvider; name: string; description: string }[] = [
  { id: "razorpay", name: "Razorpay", description: "Take payments on your forms through Razorpay." },
  { id: "cashfree", name: "Cashfree", description: "Take payments on your forms through Cashfree." },
  { id: "payu", name: "PayU", description: "Take payments on your forms through PayU." },
];

export function isPaymentProvider(id: string): id is PaymentProvider {
  return PAYMENT_PROVIDERS.some((p) => p.id === id);
}

function appTiles(apps: FormsApp[]): IntegrationTile[] {
  return apps.map((app) => ({
    kind: "app",
    id: app.id,
    name: app.name,
    category: app.category,
    description: app.description,
    connected: app.connected,
    enabled: app.enabled,
    lastUsedAt: app.lastUsedAt,
  }));
}

function paymentTiles(settings: PaymentSettings | undefined): IntegrationTile[] {
  return PAYMENT_PROVIDERS.map((p) => {
    const view = settings?.providers?.[p.id];
    return {
      kind: "payment",
      id: p.id,
      name: p.name,
      category: "payments",
      description: p.description,
      connected: Boolean(view?.test.hasKeyId || view?.live.hasKeyId),
      enabled: Boolean(view?.enabled),
      account: view?.enabled ? (view.mode === "live" ? "Live mode" : "Test mode") : undefined,
    };
  });
}

function calendarTiles(status: CalendarStatus | undefined): IntegrationTile[] {
  if (!status?.configured) return [];
  return [
    {
      kind: "calendar",
      id: "google-calendar",
      name: "Google Calendar",
      category: "scheduling",
      description: "Block busy times on booking fields, add every booking to your calendar and send a Google Meet link.",
      connected: status.connected || status.status === "revoked",
      enabled: status.connected,
      account: status.email,
    },
  ];
}

function sheetsTiles(status: SheetsStatus | undefined): IntegrationTile[] {
  if (!status?.configured) return [];
  return [
    {
      kind: "sheets",
      id: "google-sheets",
      name: "Google Sheets",
      category: "automation",
      description: "Every response becomes a new row in a spreadsheet, one sheet per form, created for you.",
      connected: status.connected || status.status === "revoked",
      enabled: status.connected,
      account: status.email,
      lastUsedAt: status.lastUsedAt,
    },
  ];
}

function telegramTiles(status: TelegramStatus | undefined): IntegrationTile[] {
  if (!status) return [];
  const live = status.chats.length > 0;
  const sender = status.mode === "own" ? status.ownBot?.username : status.platformBot;
  return [
    {
      kind: "telegram",
      id: "telegram",
      name: "Telegram",
      category: "notification",
      description: "Send scheduled reports and new form responses to Telegram, from the Quantalog bot or your own.",
      connected: live,
      enabled: live,
      account: live ? `${sender ? `@${sender} · ` : ""}${status.chats.length} chat${status.chats.length === 1 ? "" : "s"}` : undefined,
    },
  ];
}

function whatsappTiles(status: WhatsAppStatus | undefined): IntegrationTile[] {
  if (!status) return [];
  const live = status.enabled && status.numbers.length > 0;
  const count = status.numbers.length;
  return [
    {
      kind: "whatsapp",
      id: "whatsapp",
      name: "WhatsApp",
      category: "notification",
      description: "Send scheduled reports and new form responses to the WhatsApp numbers you verify.",
      connected: live,
      enabled: live,
      account: live ? `${count} number${count === 1 ? "" : "s"}` : undefined,
    },
  ];
}

function webhookTile(enabled: boolean): IntegrationTile {
  return {
    kind: "webhook",
    id: "webhook",
    name: "Webhook",
    category: "automation",
    description: "Let any form send its submissions to a URL. Set the URL and secret from that form's Webhook panel.",
    connected: enabled,
    enabled,
  };
}

export interface IntegrationSection {
  category: IntegrationCategory;
  tiles: IntegrationTile[];
}

export function buildSections(
  apps: FormsApp[] | undefined,
  payments: PaymentSettings | undefined,
  calendar: CalendarStatus | undefined,
  sheets: SheetsStatus | undefined,
  telegram: TelegramStatus | undefined,
  whatsapp: WhatsAppStatus | undefined,
  webhookEnabled: boolean,
): IntegrationSection[] {
  const all = [
    ...appTiles(apps ?? []),
    ...paymentTiles(payments),
    ...calendarTiles(calendar),
    ...sheetsTiles(sheets),
    ...whatsappTiles(whatsapp),
    ...telegramTiles(telegram),
    webhookTile(webhookEnabled),
  ];
  return CATEGORY_ORDER.map((category) => ({
    category,
    tiles: all.filter((tile) => tile.category === category),
  })).filter((section) => section.tiles.length > 0);
}
