import { useCallback, useEffect, type RefObject } from "react";
import { useComputedColorScheme } from "@mantine/core";
import { hostThemeParams } from "@/shared/lib/hostFrameUrl";

const THEME = "quantalog:theme";

export function useFrameTheme(
  frameRef: RefObject<HTMLIFrameElement | null>,
  frameBase: string,
) {
  const colorScheme = useComputedColorScheme("light");

  const send = useCallback(() => {
    frameRef.current?.contentWindow?.postMessage(
      { type: THEME, search: hostThemeParams().toString() },
      frameBase,
    );
  }, [frameRef, frameBase]);

  useEffect(() => {
    send();
  }, [colorScheme, send]);

  useEffect(() => {
    window.addEventListener("quantalog-theme-change", send);
    return () => window.removeEventListener("quantalog-theme-change", send);
  }, [send]);

  return send;
}
