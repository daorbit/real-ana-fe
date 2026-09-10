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
  }): Promise<{
    error?: { message: string };
    /** Present when the customer reached a terminal payment state in the modal. */
    paymentDetails?: { paymentMessage: string };
    /** Present when the customer closed the modal without completing. */
    redirect?: boolean;
  }>;
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

export type CashfreeCheckoutOutcome =
  /** The customer reached a terminal payment state; confirm by order id. */
  | { status: "completed" }
  /** The customer closed the sheet without paying. */
  | { status: "dismissed" }
  /** The SDK refused to open — bad or expired session. */
  | { status: "error"; message: string };

/**
 * Open Cashfree's hosted checkout in a modal over the billing page.
 *
 * `_modal` and no `return_url` on the order: the modal then resolves in-page
 * for card and UPI instead of navigating away, and `checkout()`'s promise
 * settles when the sheet closes. There is no signed payload in the result — the
 * caller confirms the outcome with a server-to-server order-status read.
 *
 * The v3 SDK reports a completed payment and a dismissal the same way (a
 * resolved promise with no `error`), so this only distinguishes an outright SDK
 * failure here; "completed vs dismissed" is settled by the follow-up status
 * check.
 */
export async function openCashfreeCheckout(params: {
  paymentSessionId: string;
  mode: CashfreeMode;
}): Promise<CashfreeCheckoutOutcome> {
  await loadCashfreeCheckout();

  const factory = (window as unknown as { Cashfree: CashfreeFactory }).Cashfree;
  const cashfree = factory({ mode: params.mode });

  try {
    const result = await cashfree.checkout({
      paymentSessionId: params.paymentSessionId,
      redirectTarget: "_modal",
    });
    if (result?.error) return { status: "error", message: result.error.message };
    return { status: "completed" };
  } catch (e) {
    return { status: "error", message: e instanceof Error ? e.message : "Checkout did not start" };
  }
}
