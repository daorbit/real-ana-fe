import { useRef, useState } from "react";
import { usePlanImageMutation, usePlanScheduledPostMutation } from "@/app/store";
import { errMessage, notify } from "@/shared/lib/notify";
import { toDateInput, type Draft } from "../components/draft";

export type PlanTurn = {
  role: "user" | "assistant";
  content: string;
  /** Orbit has everything and is showing the post for confirmation. */
  done?: boolean;
  /** Orbit is waiting on an image; the transcript offers an upload here. */
  needsImage?: boolean;
  /** A drawn image on this turn — pending until approved into the post. */
  image?: {
    url: string;
    prompt: string;
    status: "generating" | "ready" | "failed" | "approved";
  };
  /** A caption Orbit wrote on this turn — pending until approved into the
   * post, same as a drawn image, rather than silently overwriting the field. */
  caption?: {
    text: string;
    status: "ready" | "approved";
  };
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
  onAddImage,
}: {
  workspaceId: string | undefined;
  draft: Draft;
  onPlan: (patch: Partial<Draft>) => void;
  onAddImage: (url: string) => void;
}) {
  const [turns, setTurns] = useState<PlanTurn[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  /** The message the last failed turn carried, for the retry button. */
  const failed = useRef("");
  const [plan, { isLoading: thinking }] = usePlanScheduledPostMutation();
  const [generateImage] = usePlanImageMutation();
  const [generating, setGenerating] = useState(false);

  const last = turns.at(-1);
  // A caption offered on the very last turn still needs a press before the
  // post is actually finished — "done" from the model means "I'm ready to
  // show this", not "the author has already seen it".
  const ready = last?.done === true && last.caption?.status !== "ready";
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

      // Only the final caption — the one Orbit is showing for confirmation —
      // waits for a press before it lands in the form, same as a drawn image.
      // Every draft along the way fills the field silently, the way it always
      // did: a card on each intermediate rewrite would make answering "just
      // fun" or picking a time feel like approving a caption you never asked
      // to review yet.
      const captionPending = res.done && res.caption && res.caption !== draft.caption;

      setTurns([
        ...sent,
        {
          role: "assistant",
          content: res.message,
          done: res.done,
          needsImage: res.needsImage,
          caption: captionPending ? { text: res.caption, status: "ready" } : undefined,
        },
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
      if (res.caption && !captionPending) patch.caption = res.caption;
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

  /**
   * Draw an image as a turn in the conversation, not a side panel — the
   * prompt is what the author "said", so Orbit can refer to it later ("write
   * a caption for that") the same way it refers to anything else they typed.
   */
  const sendImage = async (prompt: string, turnIndex?: number) => {
    const text = prompt.trim();
    if (!text || !workspaceId || generating) return;

    if (turnIndex == null) {
      setTurns((t) => [
        ...t,
        { role: "user", content: `Draw: ${text}` },
        {
          role: "assistant",
          // Plain text too, not just the `image` field — this is what gets
          // replayed into the next `plan` call's transcript, so Orbit still
          // knows a picture exists even though the image itself never is.
          content: `I drew "${text}" for the post.`,
          image: { url: "", prompt: text, status: "generating" },
        },
      ]);
    } else {
      // A retry reuses the existing pair of turns rather than adding new ones,
      // so asking again doesn't fork the transcript into two pictures.
      setTurns((t) =>
        t.map((turn, i) =>
          i === turnIndex
            ? { ...turn, image: { url: "", prompt: text, status: "generating" } }
            : turn,
        ),
      );
    }
    setGenerating(true);

    try {
      const res = await generateImage({ workspaceId, prompt: text }).unwrap();
      setTurns((t) =>
        t.map((turn) =>
          turn.image?.prompt === text && turn.image.status === "generating"
            ? { ...turn, image: { url: res.imageUrl, prompt: text, status: "ready" } }
            : turn,
        ),
      );
    } catch (e) {
      notify.error(errMessage(e, "Orbit could not draw that."));
      setTurns((t) =>
        t.map((turn) =>
          turn.image?.prompt === text && turn.image.status === "generating"
            ? { ...turn, image: { url: "", prompt: text, status: "failed" } }
            : turn,
        ),
      );
    } finally {
      setGenerating(false);
    }
  };

  /** Put a drawn image into the post and mark the turn approved, so the
   * transcript still shows what was chosen rather than the card vanishing. */
  const approveImage = (turnIndex: number) => {
    const turn = turns[turnIndex];
    if (!turn?.image || turn.image.status !== "ready") return;
    onAddImage(turn.image.url);
    setTurns((t) =>
      t.map((turn, i) => (i === turnIndex && turn.image ? { ...turn, image: { ...turn.image, status: "approved" } } : turn)),
    );
  };

  /** Put a written caption into the post and mark the turn approved. */
  const approveCaption = (turnIndex: number) => {
    const turn = turns[turnIndex];
    if (!turn?.caption || turn.caption.status !== "ready") return;
    onPlan({ caption: turn.caption.text });
    setTurns((t) =>
      t.map((turn, i) =>
        i === turnIndex && turn.caption ? { ...turn, caption: { ...turn.caption, status: "approved" } } : turn,
      ),
    );
  };

  const reset = () => {
    setTurns([]);
    setInput("");
    setError("");
    failed.current = "";
  };

  return {
    turns, input, setInput, send, retry, thinking, ready, awaitingImage, error, reset,
    sendImage, approveImage, generatingImage: generating, approveCaption,
  };
}

/** The local wall clock — "tomorrow at 9" means the author's tomorrow. */
function localStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${toDateInput(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
