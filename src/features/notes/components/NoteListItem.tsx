import { UnstyledButton } from "@mantine/core";
import { listStamp } from "@/features/notes/noteDates";
import { noteHeadline } from "@/features/notes/noteText";
import type { Note } from "@/features/notes/types";
import classes from "@/features/notes/components/Notes.module.css";

export function NoteListItem({ note, onOpen }: { note: Note; onOpen: (id: string) => void }) {
  const { title, preview } = noteHeadline(note);

  return (
    <UnstyledButton className={`${classes.row} ${classes.tone}`} data-color={note.color} onClick={() => onOpen(note.id)}>
      <span className={classes.rowTitle}>
        {note.color !== "default" && <span className={classes.rowDot} aria-hidden="true" />}
        <span className={classes.rowTitleText}>{title}</span>
      </span>
      <span className={classes.rowMeta}>
        <span className={classes.rowStamp}>{listStamp(note.updatedAt)}</span>
        <span className={classes.rowPreview}>{preview || "No additional text"}</span>
      </span>
    </UnstyledButton>
  );
}
