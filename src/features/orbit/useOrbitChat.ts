import { useCallback, useRef, useState } from "react";
import {
  useAskOrbitMutation,
  useGetOrbitStatusQuery,
  useGetOrbitConversationsQuery,
  useLazyGetOrbitConversationQuery,
  useDeleteOrbitConversationMutation,
  useRenameOrbitConversationMutation,
} from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";
import { useAuth } from "@/features/auth/context";
import { useWorkspace } from "@/features/workspace/context";

/**
 * The Orbit conversation.
 *
 * The live thread is React state; the server keeps a copy. The state is still
 * what the panel renders and what is posted with the next question, so the
 * chat works unchanged when saving fails — history is a record, not the source
 * of truth, and a storage problem costs a saved thread rather than an answer.
 *
 * What it buys is the thing memory-only could not do: a refresh, or coming back
 * tomorrow, no longer loses the thread, and what people actually ask becomes
 * reviewable — the best docs backlog there is.
 *
 * Scoped to the workspace, because Orbit is metered per workspace: a colleague
 * who can read the analytics can read the Orbit history, which is the same rule
 * as everything else in the product.
 *
 * Shared by the floating window and the Help & support page so the two are the
 * same conversation while the tab is open — opening the page after asking
 * something in the bubble continues it rather than starting again.
 */

export type OrbitMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Set when a send failed, so the bubble can render as an error. */
  failed?: boolean;
  /**
   * What to ask next, from the model.
   *
   * Carried on the turn that produced them rather than held as one "current"
   * list, so scrolling back up a conversation shows the follow-ups that were
   * offered at each point. Only the last turn's are rendered.
   */
  suggestions?: string[];
  /**
   * Which model produced this turn.
   *
   * Shown only when it is not the one the user picked — a silent fallback would
   * make the picker look broken to anyone who noticed the answer's style
   * change.
   */
  modelLabel?: string;
};

/**
 * Where the chosen model is remembered.
 *
 * The conversation itself is deliberately not persisted, but a preference is a
 * different thing: it is a setting, not content, and re-picking a model on
 * every page load is the kind of small friction that makes a feature feel
 * unfinished.
 */
export const MODEL_KEY = "orbit.model";

/** The model this browser picked, for callers outside the chat panel. */
export function readPreferredModel(): string | undefined {
  try {
    return localStorage.getItem(MODEL_KEY) || undefined;
  } catch {
    return undefined;
  }
}

/**
 * What Orbit opens with.
 *
 * Three, not four: the panel is short, and a fourth pushed the input below the
 * fold on a laptop. Each is a question the knowledge base actually answers, so
 * the first thing a new user tries succeeds rather than teaching them the
 * assistant is useless.
 */
export const ORBIT_SUGGESTIONS = [
  "How do I install the tracker?",
  "Why is my site showing no data?",
  "What can a viewer do?",
];

let counter = 0;
const nextId = () => `orbit-${Date.now()}-${counter++}`;

export function useOrbitChat() {
  const [messages, setMessages] = useState<OrbitMessage[]>([]);
  const [input, setInput] = useState("");
  const [ask, { isLoading: thinking }] = useAskOrbitMutation();

  /**
   * The saved thread the live conversation belongs to.
   *
   * Null until the first answer comes back with an id, or until a past thread
   * is opened. A ref as well as state: `send` needs the current value without
   * being rebuilt, the same reason the transcript is one.
   */
  const [conversationId, setConversationId] = useState<string | null>(null);
  const conversationRef = useRef<string | null>(null);

  // Orbit is metered per workspace, so both calls are scoped to the active one
  // and there is nothing to ask until it is known.
  const { active } = useWorkspace();
  const { user } = useAuth();
  const workspaceId = active?._id ?? "";
  const { data: status } = useGetOrbitStatusQuery(workspaceId, { skip: !workspaceId });

  const { data: saved } = useGetOrbitConversationsQuery(workspaceId, { skip: !workspaceId });
  const [fetchConversation, { isFetching: loadingConversation }] =
    useLazyGetOrbitConversationQuery();
  const [removeConversation] = useDeleteOrbitConversationMutation();
  const [renameConversationMutation] = useRenameOrbitConversationMutation();

  // Read once, lazily: `localStorage` is unavailable in some privacy modes, and
  // a throw here would take the whole panel down over a remembered preference.
  const [model, setModelState] = useState<string>(() => {
    try {
      return localStorage.getItem(MODEL_KEY) ?? "";
    } catch {
      return "";
    }
  });

  /** Questions left this cycle. Null until the first answer reports it. */
  const [remaining, setRemaining] = useState<number | null>(null);

  // Every model is reachable on every plan now — the only thing that locks the
  // picker is running out of questions for the period, which is a workspace
  // fact, not a per-model one. `locked` here means "quota is exhausted", shown
  // on every row alike, rather than the old "this model needs a higher tier".
  const outOfQuota = remaining === 0;
  const models = (status?.models ?? []).map((m) => ({ ...m, locked: outOfQuota }));
  const activeModel = model && models.some((m) => m.id === model) ? model : models[0]?.id ?? "";

  const setModel = useCallback((id: string) => {
    // Out of quota: nothing is selectable until the period resets or the plan
    // is upgraded, so ignore the click the same way a locked model used to be
    // ignored.
    if (outOfQuota) return;
    setModelState(id);
    try {
      localStorage.setItem(MODEL_KEY, id);
    } catch {
      // Preference is lost on reload; the chat still works.
    }
  }, [outOfQuota]);

  /**
   * The transcript as the server wants it.
   *
   * A ref rather than reading `messages` inside the callback: the send appends
   * the user's turn before awaiting, so reading state there would either miss
   * that turn or force the callback to be rebuilt on every keystroke.
   */
  const historyRef = useRef<OrbitMessage[]>([]);

  const send = useCallback(
    async (raw?: string) => {
      const question = (raw ?? input).trim();
      if (!question || thinking || !workspaceId) return;

      trace(user?.id, "ask_orbit", "orbit_chat", "orbit_answer");

      const history = historyRef.current
        // A failed turn was never answered, so sending it back would present the
        // error text to the model as something Orbit said.
        .filter((m) => !m.failed)
        .map((m) => ({ role: m.role, content: m.content }));

      const userTurn: OrbitMessage = { id: nextId(), role: "user", content: question };
      setMessages((prev) => {
        const next = [...prev, userTurn];
        historyRef.current = next;
        return next;
      });
      setInput("");

      try {
        const answered = await ask({
          workspaceId,
          question,
          history,
          model: activeModel,
          // Absent on the first question: the server starts a thread and tells
          // us which one it was.
          conversationId: conversationRef.current ?? undefined,
        }).unwrap();
        setRemaining(answered.remaining);
        if (answered.conversationId) {
          conversationRef.current = answered.conversationId;
          setConversationId(answered.conversationId);
        }
        setMessages((prev) => {
          const next = [
            ...prev,
            {
              id: nextId(),
              role: "assistant" as const,
              content: answered.reply,
              suggestions: answered.suggestions,
              // Only when it differs from what was asked for — labelling every
              // answer with the model people already chose is noise.
              modelLabel:
                answered.model && answered.model !== activeModel
                  ? answered.modelLabel
                  : undefined,
            },
          ];
          historyRef.current = next;
          return next;
        });
      } catch (e) {
        // Rendered in the thread rather than as a toast: the failure belongs to
        // the question that caused it, and a toast disappears before it can be
        // read alongside what was asked.
        setMessages((prev) => {
          const next = [
            ...prev,
            {
              id: nextId(),
              role: "assistant" as const,
              content: errMessage(e, "Orbit could not answer that. Try again, or use Email support."),
              failed: true,
            },
          ];
          historyRef.current = next;
          return next;
        });
      }
    },
    [ask, input, thinking, activeModel, workspaceId, user?.id],
  );

  /**
   * Start a new thread.
   *
   * Clears the conversation id too, so the next question opens a fresh one on
   * the server rather than appending to whatever was last on screen. Nothing is
   * deleted — the previous thread stays in the list.
   */
  const reset = useCallback(() => {
    setMessages([]);
    setInput("");
    historyRef.current = [];
    conversationRef.current = null;
    setConversationId(null);
  }, []);

  /**
   * Load a saved thread into the panel and continue it.
   *
   * A failed turn is restored as a failure, so the thread reads the way it did
   * when it happened, and stays excluded from the history posted to the model
   * for the same reason it always was.
   */
  const openConversation = useCallback(
    async (id: string) => {
      if (!workspaceId) return;
      try {
        const convo = await fetchConversation({ workspaceId, conversationId: id }).unwrap();
        const restored: OrbitMessage[] = convo.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          failed: m.failed || undefined,
          suggestions: m.suggestions.length ? m.suggestions : undefined,
          modelLabel: m.modelLabel,
        }));
        setMessages(restored);
        historyRef.current = restored;
        conversationRef.current = convo.id;
        setConversationId(convo.id);
        setInput("");
      } catch {
        // Deleted in another tab, most likely. Leaving the panel on what it was
        // showing is better than blanking it over a thread that is gone.
      }
    },
    [fetchConversation, workspaceId],
  );

  /**
   * Remove a saved thread.
   *
   * Clears the panel only when it is the one on screen — deleting a thread from
   * the list should not wipe the conversation someone is in the middle of.
   */
  const removeSaved = useCallback(
    async (id: string) => {
      if (!workspaceId) return;
      await removeConversation({ workspaceId, conversationId: id }).unwrap();
      if (conversationRef.current === id) reset();
    },
    [removeConversation, workspaceId, reset],
  );

  const renameSaved = useCallback(
    async (id: string, title: string) => {
      if (!workspaceId) return;
      await renameConversationMutation({ workspaceId, conversationId: id, title }).unwrap();
    },
    [renameConversationMutation, workspaceId],
  );

  return {
    messages,
    input,
    setInput,
    send,
    reset,
    thinking,
    /** False when the server has no model key — the UI says so instead of failing on send. */
    available: status?.configured ?? true,
    started: messages.length > 0,

    /**
     * Every model, on every plan. `locked` is true on all of them together,
     * only once the workspace is out of questions for the period — the picker
     * greys the whole menu and points at Billing rather than singling out any
     * one model.
     */
    models,
    model: activeModel,
    setModel,

    /** The workspace's Orbit plan, for the quota line and the upgrade prompt. */
    plan: status?.plan ?? null,
    /** Questions left this cycle. Null until an answer reports it. */
    remaining,

    /**
     * The workspace's saved threads, newest activity first. Empty while loading
     * and when there are none — the sidebar renders the same in both cases.
     */
    conversations: saved?.conversations ?? [],
    /** The thread on screen, when it has been saved. Null on an unsaved one. */
    conversationId,
    /** True while a past thread is being pulled in, for the sidebar's spinner. */
    loadingConversation,
    openConversation,
    deleteConversation: removeSaved,
    renameConversation: renameSaved,
  };
}
