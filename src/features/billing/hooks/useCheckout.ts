import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { celebrate } from "@/shared/lib/confetti";
import {
  useStartSubscriptionMutation,
  useStartAddonPurchaseMutation,
  useConfirmPurchaseMutation,
} from "@/app/store";
import { notify, errMessage } from "@/shared/lib/notify";
import { shortDate } from "@/shared/lib/format";
import { useAuth } from "@/features/auth/context";
import { loadRazorpayCheckout, openRazorpayCheckout } from "@/features/billing/lib/razorpay";
import { openCashfreeCheckout } from "@/features/billing/lib/cashfree";
import { CHECKOUT_LOGO } from "../lib/constants";
import { usePayOrder } from "./usePayOrder";
import type {
  AutoRenewCheckout, BillingCycle, Plan, AddonPack, CouponCheckResult, Currency, AddonSelection, PaymentGateway,
} from "@/shared/types";

/** What the page shows after a purchase lands. */
export type Celebration =
  | {
      kind: "plan";
      planName: string;
      credits: { type: string; credits: number }[];
      planSlug?: string;
      highlights?: string[];
    }
  | { kind: "addon"; pack: AddonPack; packs: number };

const HIGHLIGHT_COUNT = 3;

function planCelebration(plan: Plan, credits: { type: string; credits: number }[] = []): Celebration {
  return {
    kind: "plan",
    planName: plan.name,
    credits,
    planSlug: plan.slug,
    highlights: plan.features.slice(0, HIGHLIGHT_COUNT),
  };
}

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
  const payOrder = usePayOrder();

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

  const fireConfetti = celebrate;

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

  const runAutoRenew = async (started: AutoRenewCheckout, plan: Plan) => {
    const label = `${plan.name} — ${cycle}`;
    const deferred = started.deferred;
    let paid = false;

    await loadRazorpayCheckout();
    openRazorpayCheckout({
      key: started.razorpayKeyId,
      subscription_id: started.subscriptionId,
      name: "Quantalog",
      description: label,
      image: CHECKOUT_LOGO,
      prefill: { name: user?.name, email: user?.email },
      theme: { color: "#2f6bff" },
      handler: async (response) => {
        paid = true;
        try {
          await confirmPurchase({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_signature: response.razorpay_signature,
          }).unwrap();
          await refreshUser();
          if (deferred) {
            notify.success(
              t("billing.autoRenewOnToast", "{{plan}} renews automatically from {{date}}.", {
                plan: plan.name,
                date: shortDate(started.startsAt),
              }),
            );
            return;
          }
          setCelebration(planCelebration(plan));
          fireConfetti();
        } catch (e) {
          notify.error(errMessage(e, t("billing.verifyFailed")));
        }
      },
      modal: {
        ondismiss: () => {
          if (!paid) setCancelled(label);
        },
      },
    });
  };

  const subscribe = async (
    plan: Plan,
    selection: AddonSelection = {},
    gateway: PaymentGateway = "razorpay",
    phone?: string,
    autoRenew = false,
  ) => {
    if (!workspaceId) return;
    setSubscribing(plan.slug);
    try {
      const chosen = autoRenew
        ? []
        : Object.entries(selection)
            .filter(([, packs]) => packs > 0)
            .map(([slug, packs]) => ({ slug, packs }));

      const started = await startSubscription({
        workspaceId,
        planSlug: plan.slug,
        cycle,
        couponCode: planCoupon?.coupon?.code,
        currency,
        gateway: autoRenew ? "razorpay" : gateway,
        ...(phone && !autoRenew ? { phone } : {}),
        ...(chosen.length ? { addons: chosen } : {}),
        ...(autoRenew ? { autoRenew: true } : {}),
      }).unwrap();

      // A free plan is activated server-side with no order to pay, so there is
      // no sheet to open.
      if ("free" in started && started.free) {
        await refreshUser();
        setCelebration(planCelebration(plan));
        fireConfetti();
        return;
      }

      if ("subscriptionId" in started) {
        await runAutoRenew(started, plan);
        return;
      }

      const boughtCredits = (started.addons ?? []).map((a) => ({ type: a.type, credits: a.credits }));
      const onPaid = async () => {
        await refreshUser();
        setCelebration(planCelebration(plan, boughtCredits));
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
        theme: { color: "#2f6bff" },
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

      const label = packs > 1 ? `${pack.name} × ${packs}` : pack.name;
      await payOrder(started, { description: label, onPaid, onCancelled: () => setCancelled(label) });
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
