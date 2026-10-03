import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

type NotesState = {
  opened: boolean;
  activeId: string | null;
  expanded: boolean;
  open: (noteId?: string | null) => void;
  close: () => void;
  select: (noteId: string | null) => void;
  toggleExpanded: () => void;
};

const NotesContext = createContext<NotesState | null>(null);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [opened, setOpened] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const open = useCallback((noteId: string | null = null) => {
    setActiveId(noteId);
    setOpened(true);
  }, []);
  const close = useCallback(() => setOpened(false), []);
  const toggleExpanded = useCallback(() => setExpanded((v) => !v), []);

  const value = useMemo(
    () => ({ opened, activeId, expanded, open, close, select: setActiveId, toggleExpanded }),
    [opened, activeId, expanded, open, close, toggleExpanded]
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes(): NotesState {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used inside NotesProvider");
  return ctx;
}
