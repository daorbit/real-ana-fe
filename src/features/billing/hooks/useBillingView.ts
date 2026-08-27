import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  detectCurrency, formatMoney, getStoredCurrency, setStoredCurrency,
} from "@/shared/lib/currency";
import type { BillingCycle, Currency } from "@/shared/types";

export type BillingTab = "plans" | "addons" | "history";
const BILLING_TABS: BillingTab[] = ["plans", "addons", "history"];

/**
 * Which tab, cycle and currency the page is showing.
 *
 * The tab lives in the URL so a link can point at Add-ons and the back button
 * steps between tabs; the currency is remembered across visits, because it is a
 * property of the reader rather than of the page.
 */
export function useBillingView() {
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get("tab");
  const tab: BillingTab = BILLING_TABS.includes(tabParam as BillingTab)
    ? (tabParam as BillingTab)
    : "plans";

  // "plans" is the default, so it is spelled as no query at all rather than
  // `?tab=plans` — the canonical URL for the page stays clean.
  const setTab = (next: BillingTab) => {
    setSearchParams(next === "plans" ? {} : { tab: next }, { replace: true });
  };

  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [currency, setCurrency] = useState<Currency>(() => getStoredCurrency() ?? detectCurrency());

  const changeCurrency = (v: Currency) => {
    setCurrency(v);
    setStoredCurrency(v);
  };

  const money = (amountMinor: number) => formatMoney(amountMinor, currency);

  return { tab, setTab, cycle, setCycle, currency, changeCurrency, money };
}
