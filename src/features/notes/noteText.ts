import { longDate } from "@/shared/lib";
import type { Note } from "@/features/notes/types";

export function noteTitle(note: Pick<Note, "title">): string {
  return note.title.trim() || "Untitled note";
}

export function notePreview(body: string): string {
  return body.replace(/\s+/g, " ").trim();
}

function isAutoTitle(note: Pick<Note, "title" | "createdAt">): boolean {
  const title = note.title.trim();
  return !title || title === longDate(note.createdAt);
}

export function noteHeadline(note: Pick<Note, "title" | "body" | "createdAt">): { title: string; preview: string } {
  const lines = note.body.split("\n").map((l) => l.trim()).filter(Boolean);
  if (isAutoTitle(note) && lines.length) {
    return { title: lines[0], preview: notePreview(lines.slice(1).join(" ")) };
  }
  return { title: noteTitle(note), preview: notePreview(note.body) };
}

export function wordCount(body: string): number {
  const text = body.trim();
  return text ? text.split(/\s+/).length : 0;
}

export function noteAsText(note: Pick<Note, "title" | "body">): string {
  return `${noteTitle(note)}\n\n${note.body}`.trim();
}

export function matchesNote(note: Note, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return note.title.toLowerCase().includes(q) || note.body.toLowerCase().includes(q);
}

export function downloadNote(note: Pick<Note, "title" | "body">) {
  const blob = new Blob([noteAsText(note)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${noteTitle(note).replace(/[\\/:*?"<>|]+/g, "-").slice(0, 80)}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}
