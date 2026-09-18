import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { ActivityDrawer } from "./ActivityDrawer";
import { useNotificationCount } from "./useNotificationCount";

/**
 * One activity panel for the whole app, opened from anywhere.
 *
 * There are two bells — one in the rail, one in every page header — and there
 * needs to be exactly one drawer behind them. If each bell mounted its own,
 * they would keep separate open state and separate list queries, and opening
 * one while the other was open would stack two drawers.
 *
 * The unread count lives here for the same reason. It is read by both bells,
 * and hoisting it means the poll happens once rather than once per bell.
 */

type ActivityPanel = {
  count: number;
  open: () => void;
};

const Ctx = createContext<ActivityPanel>({ count: 0, open: () => {} });

export function ActivityPanelProvider({ children }: { children: ReactNode }) {
  const [opened, setOpened] = useState(false);
  const { count } = useNotificationCount();

  const open = useCallback(() => setOpened(true), []);
  const value = useMemo(() => ({ count, open }), [count, open]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <ActivityDrawer
        opened={opened}
        onClose={() => setOpened(false)}
        unreadCount={count}
      />
    </Ctx.Provider>
  );
}

/**
 * The count and the opener.
 *
 * Returns a zero count and a no-op outside the provider rather than throwing:
 * the page header renders in a few places that sit outside the authenticated
 * shell, and a bell that quietly does not appear there is better than a screen
 * that fails to render.
 */
export function useActivityPanel(): ActivityPanel {
  return useContext(Ctx);
}
