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
 * Open Cashfree's hosted checkout in a modal over the page.
 *
 * Resolves once the sheet closes. Unlike Razorpay there is no signed payload in
 * the result — the caller confirms by asking the server to read the order
 * status — so this only reports whether the customer reached a terminal state
 * or dismissed.
 */
export async function openCashfreeCheckout(params: {
  paymentSessionId: string;
  mode: CashfreeMode;
}): Promise<{ dismissed: boolean; error?: string }> {
  await loadCashfreeCheckout();

  const factory = (window as unknown as { Cashfree: CashfreeFactory }).Cashfree;
  const cashfree = factory({ mode: params.mode });

  const result = await cashfree.checkout({
    paymentSessionId: params.paymentSessionId,
    redirectTarget: "_modal",
  });

  if (result?.error) return { dismissed: true, error: result.error.message };
  return { dismissed: false };
}
