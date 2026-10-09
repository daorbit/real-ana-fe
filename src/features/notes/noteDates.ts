import { formatDate } from "@/shared/lib";
import type { Note } from "@/features/notes/types";

const DAY_MS = 86_400_000;

function daysAgo(iso: string): number {
  const then = new Date(iso);
  const start = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((start(new Date()) - start(then)) / DAY_MS);
}

export function listStamp(iso: string): string {
  const days = daysAgo(iso);
  if (days <= 0) return formatDate(iso, { hour: "numeric", minute: "2-digit" });
  if (days === 1) return "Yesterday";
  if (days < 7) return formatDate(iso, { weekday: "long" });
  return formatDate(iso, { day: "numeric", month: "numeric", year: "2-digit" });
}

export function fullStamp(iso: string): string {
  return formatDate(iso, { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function groupLabel(iso: string): string {
  const days = daysAgo(iso);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return "Previous 7 Days";
  if (days < 30) return "Previous 30 Days";
  const date = new Date(iso);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return formatDate(iso, sameYear ? { month: "long" } : { month: "long", year: "numeric" });
}

export type NoteGroup = { label: string; notes: Note[] };

export function groupNotes(notes: Note[]): NoteGroup[] {
  const groups: NoteGroup[] = [];
  const pinned = notes.filter((n) => n.pinned);
  if (pinned.length) groups.push({ label: "Pinned", notes: pinned });

  for (const note of notes) {
    if (note.pinned) continue;
    const label = groupLabel(note.updatedAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label && last.label !== "Pinned") last.notes.push(note);
    else groups.push({ label, notes: [note] });
  }
  return groups;
}
