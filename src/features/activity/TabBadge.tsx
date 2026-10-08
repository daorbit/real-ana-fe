import { useEffect } from "react";
import { setTitleCount } from "@/shared/lib/tabTitle";
import { setFaviconBadge } from "@/shared/lib/faviconBadge";
import { useActivityPanel } from "@/features/activity/ActivityPanelContext";

export function TabBadge() {
  const { count } = useActivityPanel();

  useEffect(() => {
    setTitleCount(count);
    void setFaviconBadge(count > 0);
  }, [count]);

  useEffect(
    () => () => {
      setTitleCount(0);
      void setFaviconBadge(false);
    },
    [],
  );

  return null;
}
