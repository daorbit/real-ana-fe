import { useEffect } from "react";
import { setTitleCount } from "@/shared/lib/tabTitle";
import { useActivityPanel } from "@/features/activity/ActivityPanelContext";

export function TabBadge() {
  const { count } = useActivityPanel();

  useEffect(() => {
    setTitleCount(count);
  }, [count]);

  useEffect(() => () => setTitleCount(0), []);

  return null;
}
