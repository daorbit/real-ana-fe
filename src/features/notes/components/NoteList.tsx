import { useMemo, useState } from "react";
import { Button, Skeleton } from "@mantine/core";
import { Lock, SearchX, StickyNote } from "lucide-react";
import { NoteListItem } from "@/features/notes/components/NoteListItem";
import { NoteSearch } from "@/features/notes/components/NoteSearch";
import { ComposeButton } from "@/features/notes/components/ComposeButton";
import { PanelControls } from "@/features/notes/components/PanelControls";
import { groupNotes } from "@/features/notes/noteDates";
import { matchesNote } from "@/features/notes/noteText";
import type { Note } from "@/features/notes/types";
import classes from "@/features/notes/components/Notes.module.css";

function byRecent(a: Note, b: Note) {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

export function NoteList({
  notes,
  loading,
  creating,
  expanded,
  onToggleExpand,
  onClose,
  onOpen,
  onCreate,
}: {
  notes: Note[];
  loading: boolean;
  creating: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
  onOpen: (id: string) => void;
  onCreate: () => void;
}) {
  const [query, setQuery] = useState("");

  const groups = useMemo(
    () => groupNotes(notes.filter((n) => matchesNote(n, query)).sort(byRecent)),
    [notes, query],
  );

  const empty = !loading && notes.length === 0;
  const noMatch = !loading && notes.length > 0 && groups.length === 0;

  return (
    <>
      <header className={classes.listHead}>
        <div className={classes.listHeadTop} data-drag-handle>
          <h2 className={classes.largeTitle}>Notes</h2>
          <PanelControls expanded={expanded} onToggleExpand={onToggleExpand} onClose={onClose} />
        </div>
        {!empty && <NoteSearch value={query} onChange={setQuery} />}
      </header>

      {empty ? (
        <div className={classes.empty}>
          <span className={classes.emptyIcon}><StickyNote size={24} strokeWidth={1.75} /></span>
          <span className={classes.emptyTitle}>No Notes</span>
          <span className={classes.emptyText}>
            Capture ideas, to-dos and findings while you work. Everything saves as you type.
          </span>
          <Button size="sm" radius="xl" onClick={onCreate} loading={creating}>
            New Note
          </Button>
          <span className={classes.privacy}><Lock size={11} /> Only you can see your notes</span>
        </div>
      ) : (
        <div className={classes.list}>
          {loading && (
            <div className={classes.card}>
              {[0, 1, 2].map((i) => (
                <div key={i} className={classes.skeletonRow}>
                  <Skeleton height={12} width="55%" radius="sm" />
                  <Skeleton height={10} width="80%" radius="sm" mt={8} />
                </div>
              ))}
            </div>
          )}

          {noMatch && (
            <div className={classes.empty}>
              <span className={classes.emptyIcon}><SearchX size={22} strokeWidth={1.75} /></span>
              <span className={classes.emptyTitle}>No Results</span>
              <span className={classes.emptyText}>Nothing matches “{query.trim()}”.</span>
            </div>
          )}

          {groups.map((group) => (
            <section key={group.label} className={classes.group}>
              <h3 className={classes.groupLabel}>{group.label}</h3>
              <div className={classes.card}>
                {group.notes.map((n) => <NoteListItem key={n.id} note={n} onOpen={onOpen} />)}
              </div>
            </section>
          ))}
        </div>
      )}

      {!empty && (
        <footer className={classes.bar}>
          <span className={classes.barSpacer} />
          <span className={classes.barCount}>
            {loading ? "" : `${notes.length} ${notes.length === 1 ? "Note" : "Notes"}`}
          </span>
          <ComposeButton onClick={onCreate} loading={creating} />
        </footer>
      )}
    </>
  );
}
