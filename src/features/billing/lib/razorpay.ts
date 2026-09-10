/**
 * Loads Razorpay's Checkout script on demand rather than as a static tag —
 * only the billing page ever needs it, so every other page skips the request.
 */
let loading: Promise<void> | null = null;

export function loadRazorpayCheckout(): Promise<void> {
  if ((window as unknown as { Razorpay?: unknown }).Razorpay) return Promise.resolve();
  if (loading) return loading;

  loading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Razorpay checkout"));
    document.body.appendChild(script);
  });
  return loading;
}

/** Minimal shape of the options Razorpay Checkout accepts, typed for our usage. */
export type RazorpayCheckoutOptions = {
  key: string;
  amount?: number;
  currency?: string;
  name: string;
  description?: string;
  /** Absolute URL — Razorpay falls back to the first letter of `name` without it. */
  image?: string;
  order_id?: string;
  subscription_id?: string;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  handler: (response: Record<string, string>) => void;
  modal?: { ondismiss?: () => void };
};

export function openRazorpayCheckout(options: RazorpayCheckoutOptions) {
  type RazorpayCtor = new (opts: RazorpayCheckoutOptions) => { open: () => void };
  const Razorpay = (window as unknown as { Razorpay: RazorpayCtor }).Razorpay;
  new Razorpay(options).open();
}
