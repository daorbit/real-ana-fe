import { KeyRound, Rocket, Webhook } from "lucide-react";
import type { PaymentChecklistItem, PaymentMode, PaymentProvider } from "../../types";

export type StepId = "keys" | "webhook" | "golive";

export const STEPS: { id: StepId; label: string; hint: string; icon: typeof KeyRound }[] = [
  { id: "keys", label: "API keys", hint: "Connect your gateway account", icon: KeyRound },
  { id: "webhook", label: "Webhook", hint: "So payments get confirmed", icon: Webhook },
  { id: "golive", label: "Go live", hint: "Switch on and start charging", icon: Rocket },
];

export interface ProviderCopy {
  keyIdLabel: string;
  secretLabel: string;
  keyIdPlaceholder: (mode: PaymentMode) => string;
  keyIdHint: (mode: PaymentMode) => string;
  dashboardUrl: string;
  dashboardName: string;
  keysPath: string[];
  webhookEvents: string[];
  webhookPath: string[];
  webhookSecretless?: boolean;
  needsPhone?: boolean;
  webhookConsoleUrl: string;
}

export const PROVIDER_COPY: Record<PaymentProvider, ProviderCopy> = {
  razorpay: {
    keyIdLabel: "Key ID",
    secretLabel: "Key Secret",
    keyIdPlaceholder: (mode) => `rzp_${mode}_...`,
    keyIdHint: (mode) => `${mode === "live" ? "Live" : "Test"} keys start with rzp_${mode}_`,
    dashboardUrl: "https://dashboard.razorpay.com",
    dashboardName: "Razorpay dashboard",
    keysPath: ["Account & Settings", "API Keys"],
    webhookEvents: ["payment.captured", "payment.failed"],
    webhookPath: ["Account & Settings", "Webhooks"],
    webhookConsoleUrl: "https://dashboard.razorpay.com/app/website-app-settings/webhooks",
  },
  cashfree: {
    keyIdLabel: "App ID",
    secretLabel: "Secret Key",
    keyIdPlaceholder: () => "Your App ID",
    keyIdHint: (mode) =>
      `From the ${mode === "live" ? "production" : "sandbox"} environment. Cashfree keys look alike in both, so test the connection after saving.`,
    dashboardUrl: "https://merchant.cashfree.com",
    dashboardName: "Cashfree merchant dashboard",
    keysPath: ["Developers", "API Keys"],
    webhookEvents: ["PAYMENT_SUCCESS_WEBHOOK", "PAYMENT_FAILED_WEBHOOK", "PAYMENT_USER_DROPPED_WEBHOOK"],
    webhookPath: ["Developers", "Webhooks"],
    webhookSecretless: true,
    needsPhone: true,
    webhookConsoleUrl: "https://merchant.cashfree.com/merchants/pg/developers/webhooks",
  },
  payu: {
    keyIdLabel: "Merchant Key",
    secretLabel: "Merchant Salt",
    keyIdPlaceholder: () => "Your merchant key",
    keyIdHint: (mode) =>
      `From your ${mode === "live" ? "production" : "test"} PayU account. The key looks the same in both, so test the connection after saving.`,
    dashboardUrl: "https://onboarding.payu.in/app/account",
    dashboardName: "PayU dashboard",
    keysPath: ["Payment Gateway", "Key & Salt Details"],
    webhookEvents: ["Successful transactions", "Failed transactions"],
    webhookPath: ["Payment Gateway", "Webhooks"],
    webhookSecretless: true,
    needsPhone: true,
    webhookConsoleUrl: "https://onboarding.payu.in/app/account",
  },
};

export function firstOpenStep(checklist: PaymentChecklistItem[] | undefined): StepId {
  const first = checklist?.find((item) => !item.done);
  if (first?.id === "webhook") return "webhook";
  if (first?.id === "enabled") return "golive";
  return "keys";
}
