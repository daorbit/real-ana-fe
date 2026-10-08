import { lazy, Suspense, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/features/workspace/context";
import { useNotes } from "@/features/notes";
import { usePaletteHotkeys } from "@/shared/ui/palette/usePaletteHotkeys";

const PaletteDialog = lazy(() => import("@/shared/ui/palette/PaletteDialog"));
const ShortcutsSheet = lazy(() => import("@/shared/ui/palette/ShortcutsSheet"));

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const navigate = useNavigate();
  const { workspaces, active, setActive } = useWorkspace();
  const { open: openNotes } = useNotes();

  const closePalette = useCallback(() => setOpen(false), []);
  const openShortcuts = useCallback(() => setSheetOpen(true), []);

  usePaletteHotkeys({
    togglePalette: () => setOpen((v) => !v),
    openShortcuts,
    openNotes: () => openNotes(),
    switchWorkspace: (index) => {
      const target = workspaces[index];
      if (target && target._id !== active?._id) setActive(target._id);
    },
    go: (to) => navigate(to),
  });

  return (
    <Suspense fallback={null}>
      {open && <PaletteDialog opened onClose={closePalette} onOpenShortcuts={openShortcuts} />}
      {sheetOpen && <ShortcutsSheet opened onClose={() => setSheetOpen(false)} />}
    </Suspense>
  );
}
