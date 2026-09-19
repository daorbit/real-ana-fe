import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { ActivityDrawer } from "./ActivityDrawer";
import { useNotificationCount } from "./useNotificationCount";

 

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


export function useActivityPanel(): ActivityPanel {
  return useContext(Ctx);
}
