import { useCallback, useEffect, useState } from "react";
import type { Placed, Span, WidgetId } from "@/features/analytics/widgetCatalog";
import { WIDGET_MAP, WIDGETS } from "@/features/analytics/widgetCatalog";

export function sanitiseLayout(stored: Placed[]): Placed[] {
  const valid = new Set<string>(WIDGETS.map((w) => w.id));
  return stored.filter((p) => p && valid.has(p.id) && [1, 2, 3, 4].includes(p.span));
}

function sameLayout(a: Placed[], b: Placed[]): boolean {
  return a.length === b.length && a.every((p, i) => p.id === b[i].id && p.span === b[i].span);
}

export function useLayoutDraft(saved: Placed[], defaults: Placed[], scopeKey: string | undefined) {
  const [draft, setDraft] = useState<Placed[] | null>(null);

  useEffect(() => {
    setDraft(null);
  }, [scopeKey]);

  const layout = draft ?? saved;
  const dirty = draft !== null && !sameLayout(draft, saved);

  const revert = useCallback(() => setDraft(null), []);

  const has = useCallback((id: WidgetId) => layout.some((p) => p.id === id), [layout]);

  const spanOf = useCallback((id: WidgetId) => layout.find((p) => p.id === id)?.span, [layout]);

  const toggle = useCallback(
    (id: WidgetId) => {
      if (layout.some((p) => p.id === id)) setDraft(layout.filter((p) => p.id !== id));
      else setDraft([...layout, { id, span: WIDGET_MAP[id].defaultSpan }]);
    },
    [layout]
  );

  const remove = useCallback((id: WidgetId) => setDraft(layout.filter((p) => p.id !== id)), [layout]);

  const setSpan = useCallback(
    (id: WidgetId, span: Span) => setDraft(layout.map((p) => (p.id === id ? { ...p, span } : p))),
    [layout]
  );

  const move = useCallback(
    (from: number, to: number) => {
      if (from === to || from < 0 || to < 0) return;
      const next = [...layout];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      setDraft(next);
    },
    [layout]
  );

  const reset = useCallback(() => setDraft(defaults), [defaults]);
  const clear = useCallback(() => setDraft([]), []);
  const apply = useCallback((next: Placed[]) => setDraft(next.map((p) => ({ ...p }))), []);

  return { layout, draft, dirty, revert, has, spanOf, toggle, remove, setSpan, move, reset, clear, apply };
}

export type LayoutDraft = ReturnType<typeof useLayoutDraft>;
