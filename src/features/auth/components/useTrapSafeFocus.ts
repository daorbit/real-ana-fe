import { useCallback, useEffect, type RefObject } from "react";

export function useTrapSafeFocus(
  target: RefObject<HTMLInputElement | null>,
  active: boolean,
  trigger?: unknown,
) {
  const focus = useCallback(
    () => requestAnimationFrame(() => target.current?.focus()),
    [target],
  );

  useEffect(() => {
    if (!active) return;
    const id = focus();
    return () => cancelAnimationFrame(id);
  }, [active, focus, trigger]);

  return focus;
}
