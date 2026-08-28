import { useRef, useState } from "react";
import { usePlanScheduledPostMutation } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import { toDateInput, type Draft } from "../components/draft";

export type PlanTurn = {
  role: "user" | "assistant";
  content: string;
  /** Orbit has everything and is showing the post for confirmation. */
  done?: boolean;
  /** Orbit is waiting on an image; the transcript offers an upload here. */
  needsImage?: boolean;
};

/**
 * Plan a scheduled post by talking to Orbit.
 *
 * Every answer fills the composer's real fields, so the author watches the form
 * build rather than being handed a result at the end. The transcript stays here
 * and is never saved with the post.
 */
export function useOrbitPlan({
  workspaceId,
  draft,
  onPlan,
}: {
  workspaceId: string | undefined;
  draft: Draft;
  onPlan: (patch: Partial<Draft>) => void;
}) {
  const [turns, setTurns] = useState<PlanTurn[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  /** The message the last failed turn carried, for the retry button. */
  const failed = useRef("");
  const [plan, { isLoading: thinking }] = usePlanScheduledPostMutation();

  const last = turns.at(-1);
  const ready = last?.done === true;
  const awaitingImage = last?.needsImage === true && draft.images.length === 0;

  const send = async (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || !workspaceId || thinking) return;

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
          // Only whether pictures exist, and how many — the data URLs
          // themselves are megabytes and mean nothing to the model.
          image: draft.images.length
            ? `${draft.images.length} attached`
            : "",
          mode: draft.mode,
          date: draft.date,
          time: draft.time,
          frequency: draft.frequency,
          hour: draft.hour,
          minute: draft.minute,
          weekday: draft.weekday,
          dayOfMonth: draft.dayOfMonth,
        },
        now: localStamp(),
        // No model is sent: the server picks. This used to forward the *chat
        // panel's* picker value out of localStorage, which is a preference
        // about support answers rather than about scheduling — and the models
        // it names are the slow ones here, so a stale entry silently overrode
        // the fast default and made every plan request take half a minute.
      }).unwrap();

      setTurns([
        ...sent,
        { role: "assistant", content: res.message, done: res.done, needsImage: res.needsImage },
      ]);

      // Empty means "not decided yet", never "clear this" — writing blanks back
      // would wipe fields the author filled by hand.
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
      setError(errMessage(e, "Orbit could not finish that reply."));
      // The thread rolls back to before the attempt and the words return to the
      // box, so "try again" is one press and rewording is one edit.
      setTurns(turns);
      setInput(message);
      failed.current = message;
    }
  };

  /** Send the message that failed again, unchanged. */
  const retry = () => {
    const message = failed.current;
    if (message) void send(message);
  };

  const reset = () => {
    setTurns([]);
    setInput("");
    setError("");
    failed.current = "";
  };

  return { turns, input, setInput, send, retry, thinking, ready, awaitingImage, error, reset };
}

/** The local wall clock — "tomorrow at 9" means the author's tomorrow. */
function localStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${toDateInput(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
