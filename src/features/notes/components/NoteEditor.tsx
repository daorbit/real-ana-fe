import { UnstyledButton } from "@mantine/core";
import { ChevronLeft } from "lucide-react";
import { confirmDelete, notify } from "@/shared/lib/notify";
import { useNoteDraft } from "@/features/notes/hooks/useNoteDraft";
import { useDeleteNoteMutation, useUpdateNoteMutation } from "@/features/notes/api";
import { NoteMenu } from "@/features/notes/components/NoteMenu";
import { NoteFooter } from "@/features/notes/components/NoteFooter";
import { PanelControls } from "@/features/notes/components/PanelControls";
import { fullStamp } from "@/features/notes/noteDates";
import { downloadNote, noteAsText, wordCount } from "@/features/notes/noteText";
import type { Note } from "@/features/notes/types";
import classes from "@/features/notes/components/Notes.module.css";

const NOTES_DIALOG_Z = 340;

export function NoteEditor({
  note,
  expanded,
  onToggleExpand,
  onBack,
  onClose,
  onNew,
}: {
  note: Note;
  expanded: boolean;
  onToggleExpand: () => void;
  onBack: () => void;
  onClose: () => void;
  onNew: () => void;
}) {
  const draft = useNoteDraft(note);
  const [updateNote] = useUpdateNoteMutation();
  const [deleteNote] = useDeleteNoteMutation();
  const current = { title: draft.title, body: draft.body };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(noteAsText(current));
      notify.success("Note copied to clipboard");
    } catch {
      notify.error("Couldn't copy the note.");
    }
  };

  const remove = () => {
    confirmDelete({
      title: "Delete note?",
      body: <>“{draft.title.trim() || "Untitled note"}” will be permanently deleted.</>,
      zIndex: NOTES_DIALOG_Z,
      onConfirm: async () => {
        try {
          await deleteNote(note.id).unwrap();
          draft.discard();
          onBack();
          notify.success("Note deleted");
        } catch {
          notify.error("Couldn't delete the note.");
        }
      },
    });
  };

  return (
    <>
      <header className={classes.editorHead} data-drag-handle>
        <UnstyledButton className={classes.back} onClick={onBack} aria-label="Back to all notes">
          <ChevronLeft size={20} strokeWidth={2.25} />
          Notes
        </UnstyledButton>
        <span className={classes.headActions}>
          <NoteMenu
            color={note.color}
            pinned={note.pinned}
            onColor={(color) => void updateNote({ id: note.id, color })}
            onTogglePin={() => void updateNote({ id: note.id, pinned: !note.pinned })}
            onDelete={() => void remove()}
          />
          <PanelControls expanded={expanded} onToggleExpand={onToggleExpand} onClose={onClose} />
        </span>
      </header>

      <div className={`${classes.editorBody} ${classes.tone}`} data-color={note.color}>
        <span className={classes.stamp}>{fullStamp(note.updatedAt)}</span>
        <input
          className={classes.titleInput}
          value={draft.title}
          onChange={(e) => draft.setTitle(e.currentTarget.value)}
          onBlur={draft.flush}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.parentElement?.querySelector("textarea")?.focus();
            }
          }}
          placeholder="Title"
          maxLength={120}
          aria-label="Note title"
        />
        <textarea
          className={classes.textarea}
          value={draft.body}
          onChange={(e) => draft.setBody(e.currentTarget.value)}
          onBlur={draft.flush}
          placeholder="Start writing…"
          autoFocus={!note.body}
          aria-label="Note"
        />
      </div>

      <NoteFooter
        saveState={draft.saveState}
        updatedAt={note.updatedAt}
        words={wordCount(draft.body)}
        onCopy={() => void copy()}
        onDownload={() => downloadNote(current)}
        onNew={onNew}
      />
    </>
  );
}
