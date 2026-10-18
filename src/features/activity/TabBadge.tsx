import { useEffect } from "react";
import { setTitleCount } from "@/shared/lib/tabTitle";
import { setAppBadge } from "@/shared/lib/appBadge";
import { useActivityPanel } from "@/features/activity/ActivityPanelContext";

export function TabBadge() {
  const { count } = useActivityPanel();

  useEffect(() => {
    setTitleCount(count);
    setAppBadge(count);
  }, [count]);

  useEffect(
    () => () => {
      setTitleCount(0);
      setAppBadge(0);
    },
    [],
  );

  return null;
}
