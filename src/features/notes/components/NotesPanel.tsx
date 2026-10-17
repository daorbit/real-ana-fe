import { useEffect } from "react";
import type { KeyboardEvent } from "react";
import { Portal } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useNotes } from "@/features/notes/NotesProvider";
import { useCreateNoteMutation, useGetNotesQuery } from "@/features/notes/api";
import { useDraggablePanel } from "@/features/notes/hooks/useDraggablePanel";
import { NoteList } from "@/features/notes/components/NoteList";
import { NoteEditor } from "@/features/notes/components/NoteEditor";
import { NotesAppGate } from "@/features/notes/components/NotesAppGate";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import classes from "@/features/notes/components/Notes.module.css";

function NotesContent() {
  const { activeId, expanded, close, select, toggleExpanded } = useNotes();
  const { data: notes = [], isLoading } = useGetNotesQuery();
  const [createNote, { isLoading: creating }] = useCreateNoteMutation();
  const active = notes.find((n) => n.id === activeId);

  useEffect(() => {
    if (activeId && !isLoading && !active) select(null);
  }, [activeId, active, isLoading, select]);

  const create = async () => {
    try {
      const note = await createNote({ title: "", body: "" }).unwrap();
      select(note.id);
    } catch {
      return;
    }
  };

  return active ? (
    <NoteEditor
      key={active.id}
      note={active}
      expanded={expanded}
      onToggleExpand={toggleExpanded}
      onBack={() => select(null)}
      onClose={close}
      onNew={() => void create()}
    />
  ) : (
    <NoteList
      notes={notes}
      loading={isLoading}
      creating={creating}
      expanded={expanded}
      onToggleExpand={toggleExpanded}
      onClose={close}
      onOpen={select}
      onCreate={() => void create()}
    />
  );
}

function NotesWindow() {
  const { expanded, close, toggleExpanded } = useNotes();
  const { notes: notesOn } = useWorkspaceApps();
  const compact = useMediaQuery("(max-width: 640px)") ?? false;
  const drag = useDraggablePanel<HTMLElement>(!compact);

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape" && e.currentTarget.contains(e.target as Node)) close();
  };

  return (
    <section
      ref={drag.ref}
      className={classes.panel}
      data-expanded={expanded || undefined}
      data-dragging={drag.dragging || undefined}
      aria-label="Notes"
      onKeyDown={onKeyDown}
      onPointerDown={drag.onPointerDown}
      onDoubleClick={drag.onDoubleClick}
    >
      {!compact && (
        <div className={classes.grip} data-drag-handle title="Drag to move · double-click to reset">
          <span className={classes.gripBar} />
        </div>
      )}
      {notesOn ? (
        <NotesContent />
      ) : (
        <NotesAppGate expanded={expanded} onToggleExpand={toggleExpanded} onClose={close} />
      )}
    </section>
  );
}

export function NotesPanel() {
  const { opened } = useNotes();
  if (!opened) return null;
  return (
    <Portal>
      <NotesWindow />
    </Portal>
  );
}
