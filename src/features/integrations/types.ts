export type AppFieldType = "text" | "number" | "password" | "boolean" | "email";

export interface AppField {
  key: string;
  label: string;
  type: AppFieldType;
  secret: boolean;
  required: boolean;
  placeholder?: string;
  help?: string;
  default?: string | number | boolean;
}

export type AppCategory = "email" | "notification" | "crm" | "automation";

export interface FormsApp {
  id: string;
  name: string;
  category: AppCategory;
  description: string;
  docsUrl?: string;
  testable: boolean;
  fields: AppField[];
  connected: boolean;
  enabled: boolean;
  verifiedAt?: string;
  lastUsedAt?: string;
  config: Record<string, unknown>;
  secrets: Record<string, string>;
}

export interface FormsAppTestResult {
  ok: boolean;
  message: string;
  app: FormsApp;
}

export type PaymentProvider ="razorpay" | "cashfree" | "payu";

export type PaymentMode = "test" | "live";

export interface KeyPairView {
  keyId?: string;
  hasKeyId?: boolean;
  keySecretMask?: string;
  webhookSecretMask?: string;
  merchantId?: string;
  businessName?: string;
  verifiedAt?: string;
}

export interface PaymentChecklistItem {
  id: "keys" | "verified" | "webhook" | "enabled" | "charged";
  label: string;
  done: boolean;
  hint?: string;
}

export interface ProviderSettings {
  provider: PaymentProvider;
  label: string;
  enabled: boolean;
  mode: PaymentMode;
  test: KeyPairView;
  live: KeyPairView;
  lastChargeAt?: string;
  checklist: PaymentChecklistItem[];
}

export interface PaymentSettings {
  defaultProvider: PaymentProvider;
  providers: Record<PaymentProvider, ProviderSettings>;
  enabled: boolean;
  mode: PaymentMode;
  configurable: boolean;
  checklist: PaymentChecklistItem[];
}

export interface PaymentSettingsInput {
  provider?: PaymentProvider;
  defaultProvider?: PaymentProvider;
  enabled?: boolean;
  mode?: PaymentMode;
  target?: PaymentMode;
  keyId?: string;
  keySecret?: string;
  webhookSecret?: string;
}

export interface PaymentTestResult {
  ok: boolean;
  merchantId?: string;
  businessName?: string;
  message?: string;
  settings: PaymentSettings;
}

export interface CalendarSummary {
  id: string;
  summary: string;
  primary?: boolean;
  canWrite?: boolean;
}

export interface CalendarStatus {
  configured: boolean;
  connected: boolean;
  status?: "active" | "revoked";
  email?: string;
  calendars: CalendarSummary[];
}

export interface LinkedSheet {
  formId: string;
  formTitle: string;
  spreadsheetUrl: string;
  rows: number;
  lastRowAt?: string;
  createdAt: string;
}

export interface SheetsStatus {
  configured: boolean;
  connected: boolean;
  status?: "active" | "revoked";
  email?: string;
  lastUsedAt?: string;
  lastError?: string;
  sheets: LinkedSheet[];
}

export type IntegrationCategory =
  | "quantalog"
  | "search"
  | "email"
  | "payments"
  | "scheduling"
  | "notification"
  | "crm"
  | "automation";

export type IntegrationKind = "app" | "payment" | "calendar" | "sheets" | "webhook" | "search-console" | "telegram" | "quantalog-app";

export interface IntegrationTile {
  kind: IntegrationKind;
  id: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  connected: boolean;
  enabled: boolean;
  account?: string;
  lastUsedAt?: string;
}
