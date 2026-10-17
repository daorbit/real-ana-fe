import { CURRENCIES } from "@/shared/types";
import type { Currency, CurrencyPrices } from "@/shared/types";
import { formatMoney } from "@/shared/lib/currency";

export function money(amountMinor: number, currency: Currency = "INR"): string {
  return formatMoney(amountMinor, currency);
}

export function moneyList(prices: CurrencyPrices): string {
  return CURRENCIES.map((c) => money(prices[c], c)).join(" · ");
}

export const emptyPrices = (): CurrencyPrices =>
  Object.fromEntries(CURRENCIES.map((c) => [c, 0])) as CurrencyPrices;

export const toMajor = (prices: CurrencyPrices): CurrencyPrices =>
  Object.fromEntries(CURRENCIES.map((c) => [c, (prices[c] ?? 0) / 100])) as CurrencyPrices;

export const toMinor = (major: CurrencyPrices): CurrencyPrices =>
  Object.fromEntries(CURRENCIES.map((c) => [c, Math.round((major[c] ?? 0) * 100)])) as CurrencyPrices;

export function relativeTime(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (!Number.isFinite(minutes)) return "unknown";
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
