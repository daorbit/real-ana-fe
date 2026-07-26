import {
  createContext, useContext, useCallback, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from "react";
import { Box, Button, Group, Text, Transition, Portal } from "@mantine/core";

 
type Entry = { dirty: boolean; save: () => Promise<void>; reset: () => void };

type Ctx = { register: (id: string, entry: Entry) => void; unregister: (id: string) => void };

const SaveBarContext = createContext<Ctx | null>(null);

export function SaveBarProvider({ children }: { children: ReactNode }) {
  // A ref, not state — registrations churn on every keystroke/toggle and must
  // not each trigger a provider re-render. A version counter is what nudges the
  // bar to re-read.
  const entries = useRef(new Map<string, Entry>());
  const [, bump] = useState(0);
  const [saving, setSaving] = useState(false);

  const register = useCallback((id: string, entry: Entry) => {
    entries.current.set(id, entry);
    bump((n) => n + 1);
  }, []);
  const unregister = useCallback((id: string) => {
    entries.current.delete(id);
    bump((n) => n + 1);
  }, []);

  const dirty = [...entries.current.values()].filter((e) => e.dirty);
  const count = dirty.length;

 
  const ctxValue = useMemo(() => ({ register, unregister }), [register, unregister]);

  const saveAll = async () => {
    setSaving(true);
    try {
      // Snapshot first: saving mutates the underlying data, which re-registers
      // entries mid-loop.
      await Promise.all([...entries.current.values()].filter((e) => e.dirty).map((e) => e.save()));
    } finally {
      setSaving(false);
    }
  };

  const discardAll = () => {
    [...entries.current.values()].forEach((e) => e.dirty && e.reset());
    bump((n) => n + 1);
  };

  return (
    <SaveBarContext.Provider value={ctxValue}>
      {children}
      {/* Portalled to the body so `position: fixed` anchors to the viewport, not
          to AppShell's transformed scroll container (a transformed ancestor
          would trap it and it would only surface at the scroll bottom). */}
      <Portal>
        {/* A full-width fixed rail centers the bar with flexbox, so the only
            `transform` in play is the Transition's own slide — mixing a
            centering `translateX` with the animated `translateY` was what made
            the bar jump instead of sliding cleanly. `pointer-events: none` on
            the rail lets clicks through everywhere except the bar itself. */}
        <Box
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 24,
            zIndex: 300,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <Transition
            mounted={count > 0}
            transition="slide-up"
            duration={220}
            timingFunction="cubic-bezier(0.22, 1, 0.36, 1)"
          >
            {(style) => (
              <Group
                justify="space-between"
                wrap="nowrap"
                gap="md"
                p="sm"
                pl="lg"
                style={{
                  ...style,
                  width: "min(560px, calc(100vw - 32px))",
                  pointerEvents: "auto",
                  borderRadius: "var(--mantine-radius-md)",
                  background: "var(--mantine-color-body)",
                  border: "1px solid var(--mantine-color-default-border)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
                }}
              >
                <Text size="sm" fw={550}>
                  {count} unsaved {count === 1 ? "change" : "changes"}
                </Text>
                <Group gap="xs" wrap="nowrap">
                  <Button variant="subtle" color="gray" size="sm" onClick={discardAll} disabled={saving}>
                    Discard
                  </Button>
                  <Button color="emerald" size="sm" onClick={saveAll} loading={saving}>
                    Save changes
                  </Button>
                </Group>
              </Group>
            )}
          </Transition>
        </Box>
      </Portal>
    </SaveBarContext.Provider>
  );
}

/**
 * Register one editor's draft with the nearest SaveBar. Pass the current dirty
 * flag and callbacks; the bar handles the rest. `id` must be stable and unique
 * within the provider (e.g. the report id).
 */
export function useSaveRegistration(id: string, entry: Entry) {
  const ctx = useContext(SaveBarContext);
  // Keep the latest callbacks without re-registering on every render.
  const latest = useRef(entry);
  latest.current = entry;

  useEffect(() => {
    if (!ctx) return;
    ctx.register(id, {
      get dirty() {
        return latest.current.dirty;
      },
      save: () => latest.current.save(),
      reset: () => latest.current.reset(),
    });
    return () => ctx.unregister(id);
    // Re-register when dirtiness flips so the bar re-reads; callbacks are read
    // through the ref so they need not be deps.
  }, [ctx, id, entry.dirty]);
}
