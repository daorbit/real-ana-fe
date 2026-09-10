import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import confetti from "canvas-confetti";
import {
  useStartSubscriptionMutation,
  useStartAddonPurchaseMutation,
  useConfirmPurchaseMutation,
} from "@/app/store";
import { notify, errMessage } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";
import { useAuth } from "@/features/auth/context";
import { loadRazorpayCheckout, openRazorpayCheckout } from "@/features/billing/lib/razorpay";
import { openCashfreeCheckout } from "@/features/billing/lib/cashfree";
import { CHECKOUT_LOGO } from "../lib/constants";
import type {
  BillingCycle, Plan, AddonPack, CouponCheckResult, Currency, AddonSelection, PaymentGateway,
} from "@/shared/types";

/** What the page shows after a purchase lands. */
export type Celebration =
  | { kind: "plan"; planName: string; credits: { type: string; credits: number }[] }
  | { kind: "addon"; pack: AddonPack; packs: number };

interface Options {
  workspaceId: string | null;
  cycle: BillingCycle;
  currency: Currency;
  planCoupon: CouponCheckResult | null;
  addonCoupon: CouponCheckResult | null;
}

/**
 * Both purchase flows: order, payment sheet, verification, celebration.
 *
 * Lifted out of the page because the two are the same shape and neither is
 * about layout — they open Razorpay, wait, and reconcile what came back. The
 * page keeps only what it renders.
 */
export function useCheckout({ workspaceId, cycle, currency, planCoupon, addonCoupon }: Options) {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();

  const [startSubscription] = useStartSubscriptionMutation();
  const [startAddonPurchase] = useStartAddonPurchaseMutation();
  // One endpoint for every confirmation — plan or addon, Razorpay or Cashfree.
  const [confirmPurchase] = useConfirmPurchaseMutation();

  /** The slug/id being paid for, so only that card shows a spinner. */
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [buying, setBuying] = useState<string | null>(null);

  const [celebration, setCelebration] = useState<Celebration | null>(null);
  /**
   * What was abandoned at the payment sheet.
   *
   * Razorpay reports a dismissal the same way whether the customer paid or
   * closed the sheet, so the flows below track payment themselves and only
   * treat a dismissal as a cancellation when no payment came through.
   */
  const [cancelled, setCancelled] = useState<string | null>(null);

  const fireConfetti = () => {
    const colors = ["#10b981", "#059669", "#34d399", "#fbbf24"];
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 }, colors });
    confetti({ particleCount: 60, spread: 100, startVelocity: 45, origin: { y: 0.5 }, colors, angle: 60, decay: 0.9 });
    confetti({ particleCount: 60, spread: 100, startVelocity: 45, origin: { y: 0.5 }, colors, angle: 120, decay: 0.9 });
  };

  /**
   * Safety net for Cashfree payment methods that force a full-page redirect
   * despite the `_modal` flow (some netbanking, wallets).
   *
   * Those return to `/app/billing?cf_order_id=…`; the in-page flow above never
   * gets to confirm, so this does it on load. Runs once per id, then strips the
   * param so a refresh does not re-confirm. A 409 here means the payment did not
   * complete — quietly clear it rather than shouting an error.
   */
  const handledReturn = useRef<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("cf_order_id");
    if (!orderId || handledReturn.current === orderId) return;
    handledReturn.current = orderId;

    (async () => {
      try {
        await confirmPurchase({ gateway: "cashfree", cf_order_id: orderId }).unwrap();
        await refreshUser();
        setCelebration({
          kind: "plan",
          planName: t("billing.purchaseComplete", "your purchase"),
          credits: [],
        });
        fireConfetti();
      } catch (e) {
        const status = (e as { status?: number }).status;
        if (status !== 409 && status !== 404) {
          notify.error(errMessage(e, t("billing.verifyFailed")));
        }
      } finally {
        params.delete("cf_order_id");
        const qs = params.toString();
        window.history.replaceState({}, "", window.location.pathname + (qs ? `?${qs}` : ""));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

 
  const runCashfree = async (
    paymentSessionId: string,
    mode: "production" | "sandbox",
    orderId: string,
    opts: { onPaid: () => Promise<void>; cancelledLabel: string },
  ) => {
    const outcome = await openCashfreeCheckout({ paymentSessionId, mode });
    if (outcome.status === "error") {
      notify.error(outcome.message);
      return;
    }

    try {
      await confirmPurchase({ gateway: "cashfree", cf_order_id: orderId }).unwrap();
      await opts.onPaid();
    } catch (e) {
      const status = (e as { status?: number }).status;
      if (status === 409) {
        // "payment not completed" — the customer closed the sheet.
        setCancelled(opts.cancelledLabel);
      } else {
        notify.error(errMessage(e, t("billing.verifyFailed")));
      }
    }
  };

  const subscribe = async (
    plan: Plan,
    selection: AddonSelection = {},
    gateway: PaymentGateway = "razorpay",
    phone?: string,
  ) => {
    if (!workspaceId) return;
    trace(user?.id, "subscribe_plan_clicked", "billing", plan.slug);
    setSubscribing(plan.slug);
    try {
      const chosen = Object.entries(selection)
        .filter(([, packs]) => packs > 0)
        .map(([slug, packs]) => ({ slug, packs }));

      const started = await startSubscription({
        workspaceId,
        planSlug: plan.slug,
        cycle,
        couponCode: planCoupon?.coupon?.code,
        currency,
        gateway,
        ...(phone ? { phone } : {}),
        ...(chosen.length ? { addons: chosen } : {}),
      }).unwrap();

      // A free plan is activated server-side with no order to pay, so there is
      // no sheet to open.
      if ("free" in started && started.free) {
        await refreshUser();
        setCelebration({ kind: "plan", planName: plan.name, credits: [] });
        fireConfetti();
        return;
      }

      const boughtCredits = (started.addons ?? []).map((a) => ({ type: a.type, credits: a.credits }));
      const onPaid = async () => {
        await refreshUser();
        setCelebration({ kind: "plan", planName: plan.name, credits: boughtCredits });
        fireConfetti();
      };

      if (started.gateway === "cashfree") {
        await runCashfree(started.paymentSessionId, started.cashfreeMode, started.orderId, {
          onPaid,
          cancelledLabel: `${plan.name} — ${cycle}`,
        });
        return;
      }

      let paid = false;
      await loadRazorpayCheckout();
      openRazorpayCheckout({
        key: started.razorpayKeyId,
        amount: started.amount,
        currency: started.currency,
        order_id: started.orderId,
        name: "Quantalog",
        description: `${plan.name} — ${cycle}`,
        image: CHECKOUT_LOGO,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#059669" },
        handler: async (response) => {
          paid = true;
          try {
            await confirmPurchase({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }).unwrap();
            await onPaid();
          } catch (e) {
            notify.error(errMessage(e, t("billing.verifyFailed")));
          }
        },
        modal: {
          ondismiss: () => {
            if (!paid) setCancelled(`${plan.name} — ${cycle}`);
          },
        },
      });
    } catch (e) {
      notify.error(errMessage(e, t("billing.checkoutError")));
    } finally {
      setSubscribing(null);
    }
  };

  const buyAddon = async (
    pack: AddonPack,
    packs: number,
    gateway: PaymentGateway = "razorpay",
    phone?: string,
  ) => {
    if (!workspaceId) return;
    trace(user?.id, "buy_addon_clicked", "billing", pack.slug);
    setBuying(pack._id);
    try {
      const started = await startAddonPurchase({
        slug: pack.slug,
        workspaceId,
        couponCode: addonCoupon?.coupon?.code,
        currency,
        packs,
        gateway,
        ...(phone ? { phone } : {}),
      }).unwrap();

      const onPaid = async () => {
        await refreshUser();
        setCelebration({ kind: "addon", pack, packs });
        fireConfetti();
      };

      if (started.gateway === "cashfree") {
        await runCashfree(started.paymentSessionId, started.cashfreeMode, started.orderId, {
          onPaid,
          cancelledLabel: packs > 1 ? `${pack.name} × ${packs}` : pack.name,
        });
        return;
      }

      let paid = false;
      await loadRazorpayCheckout();
      openRazorpayCheckout({
        key: started.razorpayKeyId,
        amount: started.amount,
        currency: started.currency,
        order_id: started.orderId,
        name: "Quantalog",
        description: packs > 1 ? `${pack.name} × ${packs}` : pack.name,
        image: CHECKOUT_LOGO,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#059669" },
        handler: async (response) => {
          paid = true;
          try {
            await confirmPurchase({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }).unwrap();
            await onPaid();
          } catch (e) {
            notify.error(errMessage(e, t("billing.verifyFailed")));
          }
        },
        modal: {
          ondismiss: () => {
            if (!paid) setCancelled(pack.name);
          },
        },
      });
    } catch (e) {
      notify.error(errMessage(e, t("billing.checkoutError")));
    } finally {
      setBuying(null);
    }
  };

  return {
    subscribe,
    buyAddon,
    subscribing,
    buying,
    celebration,
    setCelebration,
    cancelled,
    setCancelled,
  };
}
