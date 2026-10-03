import { useMemo, useState } from "react";
import { Button, Skeleton, TextInput } from "@mantine/core";
import { Plus, Search, SearchX, StickyNote } from "lucide-react";
import { NoteListItem } from "@/features/notes/components/NoteListItem";
import { PanelControls } from "@/features/notes/components/PanelControls";
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

  const { pinned, others } = useMemo(() => {
    const visible = notes.filter((n) => matchesNote(n, query)).sort(byRecent);
    return { pinned: visible.filter((n) => n.pinned), others: visible.filter((n) => !n.pinned) };
  }, [notes, query]);

  const empty = !loading && notes.length === 0;
  const noMatch = !loading && notes.length > 0 && pinned.length + others.length === 0;

  return (
    <>
      <header className={classes.head} data-drag-handle>
        <span className={classes.headBadge}><StickyNote size={15} /></span>
        <span className={classes.headText}>
          <span className={classes.headTitle}>
            Notes
            {notes.length > 0 && <span className={classes.count}>{notes.length}</span>}
          </span>
          <span className={classes.headSub}>Private to you · saved as you type</span>
        </span>
        <span className={classes.headActions}>
          <PanelControls expanded={expanded} onToggleExpand={onToggleExpand} onClose={onClose} />
        </span>
      </header>

      {empty ? (
        <div className={classes.empty}>
          <span className={classes.emptyIcon}><StickyNote size={22} /></span>
          <span className={classes.emptyTitle}>No notes yet</span>
          <span className={classes.emptyText}>
            Jot down ideas, to-dos and findings while you work. Notes are private to you and saved as you type.
          </span>
          <Button size="sm" leftSection={<Plus size={15} />} onClick={onCreate} loading={creating}>
            New note
          </Button>
        </div>
      ) : (
        <>
          <div className={classes.toolbar}>
            <TextInput
              className={classes.search}
              size="sm"
              leftSection={<Search size={14} />}
              placeholder="Search notes"
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              aria-label="Search notes"
            />
            <Button size="sm" leftSection={<Plus size={15} />} onClick={onCreate} loading={creating}>
              New
            </Button>
          </div>

          <div className={classes.list}>
            {loading && [0, 1, 2].map((i) => <Skeleton key={i} className={classes.skeleton} />)}

            {noMatch && (
              <div className={classes.empty}>
                <span className={classes.emptyIcon}><SearchX size={20} /></span>
                <span className={classes.emptyTitle}>No notes match</span>
                <span className={classes.emptyText}>Try a different word, or clear the search.</span>
              </div>
            )}

            {pinned.length > 0 && <div className={classes.group}>Pinned</div>}
            {pinned.map((n) => <NoteListItem key={n.id} note={n} onOpen={onOpen} />)}

            {pinned.length > 0 && others.length > 0 && <div className={classes.group}>Others</div>}
            {others.map((n) => <NoteListItem key={n.id} note={n} onOpen={onOpen} />)}
          </div>
        </>
      )}
    </>
  );
}
