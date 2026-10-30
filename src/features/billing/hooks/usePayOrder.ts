import { useTranslation } from "react-i18next";
import { useConfirmPurchaseMutation } from "@/app/store";
import { useAuth } from "@/features/auth/context";
import { notify, errMessage } from "@/shared/lib/notify";
import type { GatewayOrder } from "@/shared/types";
import { loadRazorpayCheckout, openRazorpayCheckout } from "../lib/razorpay";
import { openCashfreeCheckout } from "../lib/cashfree";
import { CHECKOUT_LOGO } from "../lib/constants";

type PayOptions = {
  description: string;
  onPaid: () => Promise<void> | void;
  onCancelled: () => void;
};

export function usePayOrder() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [confirmPurchase] = useConfirmPurchaseMutation();

  return async (order: GatewayOrder, { description, onPaid, onCancelled }: PayOptions) => {
    if (order.gateway === "cashfree") {
      const outcome = await openCashfreeCheckout({ paymentSessionId: order.paymentSessionId, mode: order.cashfreeMode });
      if (outcome.status === "error") {
        notify.error(outcome.message);
        return;
      }
      try {
        await confirmPurchase({ gateway: "cashfree", cf_order_id: order.orderId }).unwrap();
        await onPaid();
      } catch (e) {
        if ((e as { status?: number }).status === 409) onCancelled();
        else notify.error(errMessage(e, t("billing.verifyFailed")));
      }
      return;
    }

    let paid = false;
    await loadRazorpayCheckout();
    openRazorpayCheckout({
      key: order.razorpayKeyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.orderId,
      name: "Quantalog",
      description,
      image: CHECKOUT_LOGO,
      prefill: { name: user?.name, email: user?.email },
      theme: { color: "#0071e3" },
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
          if (!paid) onCancelled();
        },
      },
    });
  };
}
