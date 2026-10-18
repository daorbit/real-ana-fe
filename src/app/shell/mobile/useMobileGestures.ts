import { useCallback, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import { api, API_TAGS } from "@/app/store/api";
import { isIosStandalone } from "@/shared/lib/standalone";
import { usePullToRefresh } from "./usePullToRefresh";
import { useEdgeSwipeBack } from "./useEdgeSwipeBack";
import { useMobileBack } from "./useMobileBack";

const MIN_SPIN_MS = 650;

export function useMobileGestures(mobile: boolean, pathname: string) {
  const dispatch = useDispatch();
  const scroller = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const { parent, goBack } = useMobileBack(pathname);
  const iosStandalone = useMemo(() => isIosStandalone(), []);

  const refresh = useCallback(async () => {
    dispatch(api.util.invalidateTags([...API_TAGS]));
    await new Promise((resolve) => window.setTimeout(resolve, MIN_SPIN_MS));
  }, [dispatch]);

  const scrollToTop = useCallback(() => {
    scroller.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  usePullToRefresh(scroller, indicator, mobile, refresh);
  useEdgeSwipeBack(panel, mobile && iosStandalone && Boolean(parent), goBack);

  return { scroller, indicator, panel, scrollToTop, isDetail: Boolean(parent) };
}
