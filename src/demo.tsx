import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "./auth";

const KEY = "quantalog_demo_data";

type DemoValue = {
  /** Demo data is being shown in place of the workspace's real numbers. */
  demo: boolean;
  /** Whether this viewer may switch modes at all. */
  available: boolean;
  toggle: (next: boolean) => void;
};

const Ctx = createContext<DemoValue>({ demo: false, available: false, toggle: () => {} });

/**
 * Demo data mode.
 *
 * Swaps every dashboard number for a generated sample set, so the product can
 * be shown populated when an account has no traffic of its own. It is a display
 * switch only: nothing is written, sent, or counted, and the real payload keeps
 * loading underneath so switching back is instant.
 *
 * Admin-only. A customer seeing fabricated numbers on their own dashboard would
 * have no way to tell them from real ones.
 */
export function DemoProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const available = user?.role === "admin";

  const [on, setOn] = useState(() => sessionStorage.getItem(KEY) === "1");

  const toggle = useCallback((next: boolean) => {
    setOn(next);
    // sessionStorage, not localStorage: demo mode should not survive into a new
    // session, where sample numbers could be mistaken for real traffic.
    if (next) sessionStorage.setItem(KEY, "1");
    else sessionStorage.removeItem(KEY);
  }, []);

  // Gate the value, not just the control: losing admin mid-session must drop
  // back to real data rather than leave stale sample numbers on screen.
  const demo = available && on;

  const value = useMemo(() => ({ demo, available, toggle }), [demo, available, toggle]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDemo() {
  return useContext(Ctx);
}
