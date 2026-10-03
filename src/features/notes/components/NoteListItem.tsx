import { UnstyledButton } from "@mantine/core";
import { Pin } from "lucide-react";
import { timeAgo } from "@/shared/lib";
import { notePreview, noteTitle } from "@/features/notes/noteText";
import type { Note } from "@/features/notes/types";
import classes from "@/features/notes/components/Notes.module.css";

export function NoteListItem({ note, onOpen }: { note: Note; onOpen: (id: string) => void }) {
  const preview = notePreview(note.body);

  return (
    <UnstyledButton className={`${classes.item} ${classes.tone}`} data-color={note.color} onClick={() => onOpen(note.id)}>
      <span className={classes.itemTitle}>
        <span className={classes.itemTitleText}>{noteTitle(note)}</span>
        {note.pinned && <Pin size={11} className={classes.itemPin} aria-label="Pinned" />}
        <span className={classes.itemTime}>{timeAgo(note.updatedAt)}</span>
      </span>
      <span className={classes.itemPreview} data-empty={!preview || undefined}>
        {preview || "No content yet"}
      </span>
    </UnstyledButton>
  );
}
