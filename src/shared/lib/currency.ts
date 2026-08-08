import { CURRENCIES, CURRENCY_SYMBOLS, type Currency, type CurrencyPrices } from "@/shared/types";

/** Locale territory to currency — everything outside India defaults to USD. */
const LOCALE_CURRENCY: Record<string, Currency> = {
  IN: "INR",
};

/**
 * Best-effort currency from the browser's own locale, used only as the
 * initial value for the manual filter below.
 */
export function detectCurrency(): Currency {
  const locale = typeof navigator !== "undefined" ? navigator.language : "en-US";
  const region = locale.split("-")[1]?.toUpperCase();
  if (region && LOCALE_CURRENCY[region]) return LOCALE_CURRENCY[region];
  return "USD";
}

const CURRENCY_STORAGE_KEY = "billing.currency";

/** The user's manually-picked currency, if they've ever changed it from the detected default. */
export function getStoredCurrency(): Currency | null {
  if (typeof localStorage === "undefined") return null;
  const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
  return (CURRENCIES as readonly string[]).includes(stored ?? "") ? (stored as Currency) : null;
}

export function setStoredCurrency(currency: Currency): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
}

const LOCALE_BY_CURRENCY: Record<Currency, string> = {
  INR: "en-IN",
  USD: "en-US",
};

/** Smallest-unit amount (paise/cents) to a display string in the given currency. */
export function formatMoney(amountMinor: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  const major = amountMinor / 100;
  return `${symbol}${major.toLocaleString(LOCALE_BY_CURRENCY[currency], { maximumFractionDigits: 0 })}`;
}

/** Pull one currency's amount out of a per-currency price object. */
export function priceIn(prices: CurrencyPrices, currency: Currency): number {
  return prices[currency] ?? 0;
}

export { CURRENCIES };
export type { Currency };
