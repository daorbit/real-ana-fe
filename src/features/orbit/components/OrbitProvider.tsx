import { createContext, useContext, useMemo, useState } from "react";
import { useOrbitChat } from "@/features/orbit/useOrbitChat";

/**
 * One Orbit conversation, shared by the floating bubble and the Help & support
 * page.
 *
 * Without this each surface would call the hook and get its own thread: asking
 * something in the bubble, then opening the page to see it properly, would show
 * an empty chat and lose the question. Since the conversation is only ever
 * in-memory, the provider is also the thing that decides how long it lives —
 * mounted at the app shell, so it survives navigation and ends with the tab.
 *
 * It also owns whether the bubble is open, so anything else can start a
 * conversation: a future "Ask Orbit about this" beside an error only needs
 * `open()`.
 */

type OrbitContext = {
  chat: ReturnType<typeof useOrbitChat>;
  opened: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const Ctx = createContext<OrbitContext | null>(null);

export function OrbitProvider({ children }: { children: React.ReactNode }) {
  const chat = useOrbitChat();
  const [opened, setOpened] = useState(false);

  const value = useMemo(
    () => ({
      chat,
      opened,
      open: () => setOpened(true),
      close: () => setOpened(false),
      toggle: () => setOpened((v) => !v),
    }),
    [chat, opened],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOrbit(): OrbitContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useOrbit must be used inside <OrbitProvider>");
  return ctx;
}

/**
 * Orbit, if it is available here.
 *
 * Returns null outside the provider instead of throwing. That case is real:
 * the SEO panels are shared with the public shared-report page and the print
 * view, which render for someone with no account and therefore no assistant.
 * Anything offering an "Ask Orbit" action uses this and renders nothing when
 * it comes back null.
 */
export function useOrbitOptional(): OrbitContext | null {
  return useContext(Ctx);
}
