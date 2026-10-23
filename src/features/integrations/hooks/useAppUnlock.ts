import { useState } from "react";
import { useGetAppPricesQuery, useStartAppPurchaseMutation } from "@/app/store";
import { useWorkspace } from "@/features/workspace/context";
import { useDemo } from "@/features/demo/context";
import { usePayOrder } from "@/features/billing/hooks/usePayOrder";
import { detectCurrency, formatMoney, getStoredCurrency } from "@/shared/lib/currency";
import { notify, errMessage } from "@/shared/lib/notify";
import type { PaymentGateway, WorkspaceAppId } from "@/shared/types";
import { WORKSPACE_APP_INFO } from "../lib/quantalogApps";
import { appUnlocked, isPaidApp } from "../lib/paidApps";

export type UnlockRequest = { couponCode?: string; gateway: PaymentGateway; phone?: string };

export function useAppUnlock(app: WorkspaceAppId) {
  const { active } = useWorkspace();
  const { demo } = useDemo();
  const info = WORKSPACE_APP_INFO[app];
  const paid = isPaidApp(app);
  const locked = paid && !demo && !appUnlocked(active?.apps, app);
  const currency = getStoredCurrency() ?? detectCurrency();

  const { data: prices } = useGetAppPricesQuery(undefined, { skip: !locked });
  const price = prices?.find((p) => p.appId === app)?.price[currency] ?? null;

  const [startPurchase] = useStartAppPurchaseMutation();
  const payOrder = usePayOrder();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [buying, setBuying] = useState(false);

  const buy = async ({ couponCode, gateway, phone }: UnlockRequest) => {
    if (!active || !isPaidApp(app)) return;
    setBuying(true);
    try {
      const started = await startPurchase({
        appId: app,
        workspaceId: active._id,
        couponCode,
        currency,
        gateway,
        ...(phone ? { phone } : {}),
      }).unwrap();
      await payOrder(started, {
        description: info.name,
        onPaid: () => {
          setCheckoutOpen(false);
          notify.success(`${info.name} is unlocked and on. Find ${info.navLabel} ${info.location}.`);
        },
        onCancelled: () => notify.info("Payment cancelled. Nothing was charged."),
      });
    } catch (e) {
      notify.error(errMessage(e, `Could not start checkout for ${info.name}.`));
    } finally {
      setBuying(false);
    }
  };

  return {
    locked,
    price,
    currency,
    priceLabel: price !== null ? formatMoney(price, currency) : null,
    checkoutOpen,
    openCheckout: () => setCheckoutOpen(true),
    closeCheckout: () => setCheckoutOpen(false),
    buying,
    buy,
  };
}
