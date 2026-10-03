import { useCallback, useEffect, useRef, useState } from "react";
import { useUpdateNoteMutation } from "@/features/notes/api";
import type { Note, NotePatch } from "@/features/notes/types";

export type SaveState = "idle" | "saving" | "saved" | "error";

const SAVE_DELAY = 700;

export function useNoteDraft(note: Note) {
  const [updateNote] = useUpdateNoteMutation();
  const [title, setTitleState] = useState(note.title);
  const [body, setBodyState] = useState(note.body);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const pending = useRef<NotePatch>({});
  const timer = useRef<number | undefined>(undefined);

  const flush = useCallback(() => {
    window.clearTimeout(timer.current);
    const patch = pending.current;
    if (Object.keys(patch).length === 0) return;
    pending.current = {};
    setSaveState("saving");
    updateNote({ id: note.id, ...patch })
      .unwrap()
      .then(() => setSaveState("saved"))
      .catch(() => setSaveState("error"));
  }, [note.id, updateNote]);

  const schedule = useCallback(
    (patch: NotePatch) => {
      pending.current = { ...pending.current, ...patch };
      setSaveState("saving");
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(flush, SAVE_DELAY);
    },
    [flush]
  );

  const discard = useCallback(() => {
    window.clearTimeout(timer.current);
    pending.current = {};
  }, []);

  const flushRef = useRef(flush);
  flushRef.current = flush;
  useEffect(() => () => flushRef.current(), []);

  const setTitle = (value: string) => {
    setTitleState(value);
    schedule({ title: value });
  };

  const setBody = (value: string) => {
    setBodyState(value);
    schedule({ body: value });
  };

  return { title, body, setTitle, setBody, saveState, flush, discard };
}
