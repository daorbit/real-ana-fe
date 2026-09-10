/**
 * Loads Cashfree's Checkout SDK on demand, mirroring `razorpay.ts` — only the
 * billing page needs it, so every other page skips the request.
 */
let loading: Promise<void> | null = null;

type CashfreeMode = "production" | "sandbox";

interface CashfreeInstance {
  checkout(opts: {
    paymentSessionId: string;
    redirectTarget?: "_self" | "_blank" | "_modal";
  }): Promise<{ error?: { message: string }; paymentDetails?: { paymentMessage: string } }>;
}

type CashfreeFactory = (opts: { mode: CashfreeMode }) => CashfreeInstance;

export function loadCashfreeCheckout(): Promise<void> {
  if ((window as unknown as { Cashfree?: unknown }).Cashfree) return Promise.resolve();
  if (loading) return loading;

  loading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Cashfree checkout"));
    document.body.appendChild(script);
  });
  return loading;
}

/**
 * Send the browser to Cashfree's hosted checkout.
 *
 * A full-page redirect (`_self`), not a modal: the modal flow silently falls
 * back to a redirect for UPI and some cards, and the `checkout()` promise then
 * never resolves, hanging the page. The server set a `return_url` back to
 * `/billing?cf_order_id=…`; the billing page reads that on load and confirms.
 *
 * This call does not return in the success case — navigation has already
 * happened. It only throws (and returns) if the SDK rejects the session
 * outright, e.g. an expired or malformed `paymentSessionId`.
 */
export async function startCashfreeRedirect(params: {
  paymentSessionId: string;
  mode: CashfreeMode;
}): Promise<{ error: string }> {
  await loadCashfreeCheckout();

  const factory = (window as unknown as { Cashfree: CashfreeFactory }).Cashfree;
  const cashfree = factory({ mode: params.mode });

  try {
    const result = await cashfree.checkout({
      paymentSessionId: params.paymentSessionId,
      redirectTarget: "_self",
    });
    return { error: result?.error?.message ?? "Checkout did not start" };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Checkout did not start" };
  }
}
