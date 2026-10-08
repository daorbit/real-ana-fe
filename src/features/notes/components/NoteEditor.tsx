import { ActionIcon, Tooltip } from "@mantine/core";
import { ChevronLeft } from "lucide-react";
import { useDispatch } from "react-redux";
import { notify } from "@/shared/lib/notify";
import { deferDelete } from "@/shared/lib/deferDelete";
import { shortDate } from "@/shared/lib";
import type { AppDispatch } from "@/app/store";
import { useNoteDraft } from "@/features/notes/hooks/useNoteDraft";
import { useNotes } from "@/features/notes/NotesProvider";
import { hideNote, useDeleteNoteMutation, useUpdateNoteMutation } from "@/features/notes/api";
import { NoteMenu } from "@/features/notes/components/NoteMenu";
import { NoteFooter } from "@/features/notes/components/NoteFooter";
import { PanelControls } from "@/features/notes/components/PanelControls";
import { downloadNote, noteAsText, wordCount } from "@/features/notes/noteText";
import type { Note } from "@/features/notes/types";
import classes from "@/features/notes/components/Notes.module.css";

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
  const dispatch = useDispatch<AppDispatch>();
  const { open: openNote } = useNotes();
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
    draft.discard();
    onBack();
    deferDelete({
      key: `note:${note.id}`,
      message: "Note deleted",
      errorMessage: "Couldn't delete the note.",
      hide: () => dispatch(hideNote(note.id)),
      commit: () => deleteNote(note.id).unwrap(),
      onUndo: () => openNote(note.id),
    });
  };

  return (
    <>
      <header className={`${classes.head} ${classes.editorHead} ${classes.tone}`} data-color={note.color} data-drag-handle>
        <Tooltip label="All notes" withArrow>
          <ActionIcon variant="subtle" color="gray" radius="md" onClick={onBack} aria-label="Back to all notes">
            <ChevronLeft size={17} />
          </ActionIcon>
        </Tooltip>
        <input
          className={classes.titleInput}
          value={draft.title}
          onChange={(e) => draft.setTitle(e.currentTarget.value)}
          onBlur={draft.flush}
          placeholder="Untitled note"
          maxLength={120}
          aria-label="Note title"
        />
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

      <div className={classes.editorBody}>
        <span className={classes.editorMeta}>
          Created {shortDate(note.createdAt)}
          {note.pinned && <span className={classes.metaChip}>Pinned</span>}
        </span>
        <textarea
          className={classes.textarea}
          value={draft.body}
          onChange={(e) => draft.setBody(e.currentTarget.value)}
          onBlur={draft.flush}
          placeholder="Start typing…"
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
