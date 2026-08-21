import { useState } from "react";
import { usePlanScheduledPostMutation } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import { toDateInput, type Draft } from "../components/draft";

export type PlanTurn = {
  role: "user" | "assistant";
  content: string;
  /** Set on the turn where Orbit says it has everything, so the transcript can
   *  show the confirm card under that message rather than under the last one. */
  done?: boolean;
};

/**
 * Plan a scheduled post by talking to Orbit.
 *
 * A scheduled post needs two decisions — what it says and when it goes out —
 * and someone who arrives with only the first shouldn't have to work the rest
 * of the form out alone. Orbit asks for what is missing, one question at a
 * time, and every answer fills the real composer fields: the author watches
 * the form build rather than being handed a result at the end.
 *
 * The transcript lives here, not on the draft. It is the conversation that
 * produced the post, not part of the post, and saving it would store a chat
 * log nobody asked to keep.
 */
export function useOrbitPlan({
  workspaceId,
  draft,
  onPlan,
}: {
  workspaceId: string | undefined;
  /** The live draft — sent each turn so Orbit builds on what is already there. */
  draft: Draft;
  onPlan: (patch: Partial<Draft>) => void;
}) {
  const [turns, setTurns] = useState<PlanTurn[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [plan, { isLoading: thinking }] = usePlanScheduledPostMutation();

  /** True once Orbit has said it has everything and is waiting to be confirmed. */
  const ready = turns.at(-1)?.done === true;

  const send = async (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || !workspaceId || thinking) return;

    // Optimistic: the author's own words appear the moment they send them,
    // rather than after a model call they are waiting on.
    const sent: PlanTurn[] = [...turns, { role: "user", content: message }];
    setTurns(sent);
    setInput("");
    setError("");

    try {
      const res = await plan({
        workspaceId,
        platform: draft.provider === "instagram" ? "facebook" : "linkedin",
        message,
        turns,
        draft: {
          provider: draft.provider,
          name: draft.name,
          caption: draft.caption,
          mode: draft.mode,
          date: draft.date,
          time: draft.time,
          frequency: draft.frequency,
          hour: draft.hour,
          minute: draft.minute,
          weekday: draft.weekday,
          dayOfMonth: draft.dayOfMonth,
        },
        // The author's own wall clock. "Tomorrow at 9" means their tomorrow,
        // and the server has no way to know which zone that is.
        now: localStamp(),
      }).unwrap();

      setTurns([...sent, { role: "assistant", content: res.message, done: res.done }]);

      // Only what Orbit actually settled. Empty strings are "not decided yet",
      // not "clear this" — writing them back would blank fields the author has
      // already filled by hand.
      const patch: Partial<Draft> = {
        mode: res.mode,
        frequency: res.frequency,
        hour: res.hour,
        minute: res.minute,
        weekday: res.weekday,
        dayOfMonth: res.dayOfMonth,
      };
      if (res.caption) patch.caption = res.caption;
      if (res.name) patch.name = res.name;
      if (res.mode === "once" && res.date && res.time) {
        patch.date = res.date;
        patch.time = res.time;
      }
      onPlan(patch);
    } catch (e) {
      // Shown in the thread rather than as a toast: the conversation is where
      // the author is looking, and a failed turn is part of it.
      setError(errMessage(e, "Orbit could not follow that. Try rewording it."));
      setTurns(turns);
      setInput(message);
    }
  };

  const reset = () => {
    setTurns([]);
    setInput("");
    setError("");
  };

  return { turns, input, setInput, send, thinking, ready, error, reset };
}

/** "2026-08-21T14:30" — the local wall clock, without pretending to be UTC. */
function localStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${toDateInput(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
