
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

export type RazorpayCheckoutOptions = {
  key: string;
  amount?: number;
  currency?: string;
  name: string;
  description?: string;
  image?: string;
  order_id?: string;
  subscription_id?: string;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  handler: (response: Record<string, string>) => void;
  modal?: { ondismiss?: () => void; backdropclose?: boolean; escape?: boolean };
  redirect?: boolean;
};

export function openRazorpayCheckout(options: RazorpayCheckoutOptions) {
  type RazorpayCtor = new (opts: RazorpayCheckoutOptions) => { open: () => void };
  const Razorpay = (window as unknown as { Razorpay: RazorpayCtor }).Razorpay;
  new Razorpay({ redirect: false, ...options }).open();
}
