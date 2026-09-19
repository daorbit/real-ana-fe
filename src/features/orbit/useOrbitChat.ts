import { useCallback, useEffect, useRef, useState } from "react";
import {
  useAskOrbitMutation,
  useGetOrbitStatusQuery,
  useLazyGetOrbitConversationsQuery,
  useLazyGetOrbitConversationQuery,
  useDeleteOrbitConversationMutation,
  useBulkDeleteOrbitConversationsMutation,
  useRenameOrbitConversationMutation,
} from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";
import { useAuth } from "@/features/auth/context";
import { useWorkspace } from "@/features/workspace/context";

type OrbitConversationSummary = {
  id: string;
  title: string;
  messageCount: number;
  lastMessageAt: string;
  lastModelLabel: string;
  createdAt: string;
  userId: string | null;
};

 

export type OrbitMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** A user turn's attached image — a data URL locally, a Cloudinary URL once
   * restored from a saved conversation. */
  imageUrl?: string;
  /** Set when a send failed, so the bubble can render as an error. */
  failed?: boolean;
  /**
   * Set when the question was abandoned rather than answered.
   *
   * Distinct from `failed`: nothing went wrong, so it is not shown as a
   * problem — but it is also not an answer, so it is kept out of the history
   * posted to the model for the same reason a failure is.
   */
  stopped?: boolean;
  suggestions?: string[];
  modelLabel?: string;
  /** The tenant's 7-day figures as data, set only when this answer used them.
   * Rendered as a table under the prose — see `DataDigestTable`. */
  dataDigest?: unknown;
  digestAt?: string;
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

let counter = 0;
const nextId = () => `orbit-${Date.now()}-${counter++}`;

export function useOrbitChat() {
  const [messages, setMessages] = useState<OrbitMessage[]>([]);
  const [input, setInput] = useState("");
  const [ask, { isLoading: thinking }] = useAskOrbitMutation();

  const [generatingImage, setGeneratingImage] = useState(false);

  const [pendingImage, setPendingImage] = useState<string | null>(null);

  const [imageMode, setImageMode] = useState(false);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const conversationRef = useRef<string | null>(null);

  // Orbit is metered per workspace, so both calls are scoped to the active one
  // and there is nothing to ask until it is known.
  const { active } = useWorkspace();
  const { user } = useAuth();
  const workspaceId = active?._id ?? "";
  const { data: status } = useGetOrbitStatusQuery(workspaceId, { skip: !workspaceId });


  const [conversationPages, setConversationPages] = useState<OrbitConversationSummary[]>([]);
  const [conversationsCursor, setConversationsCursor] = useState<string | null>(null);
  const [hasMoreConversations, setHasMoreConversations] = useState(true);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMoreConversations, setLoadingMoreConversations] = useState(false);
  const [fetchConversationsPage] = useLazyGetOrbitConversationsQuery();
  /** Whether the first page has been asked for under the current workspace. */
  const conversationsRequested = useRef(false);

  const loadFirstConversationsPage = useCallback(async () => {
    if (!workspaceId) return;
    setLoadingConversations(true);
    try {
      const page = await fetchConversationsPage({ workspaceId }).unwrap();
      setConversationPages(page.conversations);
      setConversationsCursor(page.nextCursor);
      setHasMoreConversations(page.nextCursor != null);
    } catch {
      // Left empty — the drawer's own empty state reads fine as "nothing yet"
      // and a toast over a sidebar list would be noise.
    } finally {
      setLoadingConversations(false);
    }
  }, [fetchConversationsPage, workspaceId]);


  useEffect(() => {
    setConversationPages([]);
    setConversationsCursor(null);
    setHasMoreConversations(true);
    conversationsRequested.current = false;
  }, [workspaceId]);

  const ensureConversationsLoaded = useCallback(() => {
    if (conversationsRequested.current || !workspaceId) return;
    conversationsRequested.current = true;
    void loadFirstConversationsPage();
  }, [loadFirstConversationsPage, workspaceId]);

  const loadMoreConversations = useCallback(async () => {
    if (!workspaceId || !hasMoreConversations || loadingMoreConversations || loadingConversations) return;
    setLoadingMoreConversations(true);
    try {
      const page = await fetchConversationsPage({
        workspaceId,
        cursor: conversationsCursor ?? undefined,
      }).unwrap();
      setConversationPages((prev) => [...prev, ...page.conversations]);
      setConversationsCursor(page.nextCursor);
      setHasMoreConversations(page.nextCursor != null);
    } catch {
      // Leaves `hasMoreConversations` as-is — the sentinel simply tries again
      // on the next scroll, no different from a missed network blip elsewhere.
    } finally {
      setLoadingMoreConversations(false);
    }
  }, [fetchConversationsPage, workspaceId, conversationsCursor, hasMoreConversations, loadingMoreConversations, loadingConversations]);

  const [fetchConversation, { isFetching: loadingConversation }] =
    useLazyGetOrbitConversationQuery();
  const [removeConversation] = useDeleteOrbitConversationMutation();
  const [bulkRemoveConversations] = useBulkDeleteOrbitConversationsMutation();
  const [renameConversationMutation] = useRenameOrbitConversationMutation();

  const [model, setModelState] = useState<string>(() => {
    try {
      return localStorage.getItem(MODEL_KEY) ?? "";
    } catch {
      return "";
    }
  });

  /** Questions left this cycle. Null until the first answer reports it. */
  const [remaining, setRemaining] = useState<number | null>(null);

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

  const historyRef = useRef<OrbitMessage[]>([]);


  const inFlight = useRef<{ abort: () => void } | null>(null);
  const abandoned = useRef(false);


  const run = useCallback(
    async (opts: {
      question: string;
      image?: string;
      drawing: boolean;
      /** The transcript as it stands *before* this question's own turn. */
      history: OrbitMessage[];
    }) => {
      const history = opts.history

        .filter((m) => !m.failed && !m.stopped)
        .map((m) => ({ role: m.role, content: m.content }));

      setGeneratingImage(opts.drawing);
      abandoned.current = false;

      try {
        const request = ask({
          workspaceId,
          question: opts.question,
          history,
          model: activeModel,
          image: opts.image,
          generateImage: opts.drawing,

          conversationId: conversationRef.current ?? undefined,
        });
        inFlight.current = request;

        const answered = await request.unwrap();
        setRemaining(answered.remaining);
        if (answered.conversationId) {
          conversationRef.current = answered.conversationId;
          setConversationId(answered.conversationId);
          // A new thread just appeared, or an existing one just moved to the
          // top on `lastMessageAt` — either way the first page is stale.
          void loadFirstConversationsPage();
        }
        setMessages((prev) => {
          const next = [
            ...prev,
            {
              id: nextId(),
              role: "assistant" as const,
              content: answered.reply,
              imageUrl: answered.imageUrl,
              suggestions: answered.suggestions,
              dataDigest: answered.dataDigest,
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

        if (abandoned.current) {
          setMessages((prev) => {
            const next = [
              ...prev,
              {
                id: nextId(),
                role: "assistant" as const,
                content: "Stopped.",
                stopped: true,
              },
            ];
            historyRef.current = next;
            return next;
          });
          return;
        }

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
      } finally {
        inFlight.current = null;
        setGeneratingImage(false);
      }
    },
    [ask, activeModel, workspaceId, loadFirstConversationsPage],
  );


  const stop = useCallback(() => {
    abandoned.current = true;
    inFlight.current?.abort();
    inFlight.current = null;
  }, []);

  const send = useCallback(
    async (raw?: string) => {
      const question = (raw ?? input).trim();
      const image = pendingImage;

      if ((!question && !image) || thinking || !workspaceId) return;

      trace(user?.id, "ask_orbit", "orbit_chat", "orbit_answer");

      const before = historyRef.current;
      const userTurn: OrbitMessage = {
        id: nextId(),
        role: "user",
        content: question,
        imageUrl: image ?? undefined,
      };
      setMessages(() => {
        const next = [...before, userTurn];
        historyRef.current = next;
        return next;
      });
      setInput("");
      setPendingImage(null);
      const drawing = imageMode && !image;

      if (!drawing) setImageMode(false);

      await run({ question, image: image ?? undefined, drawing, history: before });
    },
    [run, input, pendingImage, imageMode, thinking, workspaceId, user?.id],
  );

 
  const regenerateLast = useCallback(async () => {
    const current = historyRef.current;
    const lastIndex = current.length - 1;
    const last = current[lastIndex];
    if (!last || last.role !== "assistant" || thinking) return;

    const userTurn = current[lastIndex - 1];
    if (!userTurn || userTurn.role !== "user") return;
    if (!userTurn.content && !userTurn.imageUrl) return;

    const withoutLast = current.slice(0, lastIndex);
    setMessages(withoutLast);
    historyRef.current = withoutLast;

    trace(user?.id, "regenerate_orbit", "orbit_chat", "orbit_answer");

    await run({
      question: userTurn.content,
      image: userTurn.imageUrl,
      drawing: last.stopped
        ? imageMode && !userTurn.imageUrl
        : Boolean(last.imageUrl) && !userTurn.imageUrl,
      history: withoutLast.slice(0, -1),
    });
  }, [run, thinking, imageMode, user?.id]);


  const editAndResend = useCallback(
    async (messageId: string, text: string) => {
      const question = text.trim();
      if (!question || thinking) return;

      const current = historyRef.current;
      const at = current.findIndex((m) => m.id === messageId);
      if (at < 0 || current[at].role !== "user") return;

      const before = current.slice(0, at);
      const edited: OrbitMessage = { ...current[at], content: question };

      const next = [...before, edited];
      setMessages(next);
      historyRef.current = next;

      trace(user?.id, "edit_orbit_question", "orbit_chat", "orbit_answer");

      await run({
        question,
        image: edited.imageUrl,
        // Read off the answer this question originally got, before it is
        // dropped: editing "draw a pizza" should draw again, not describe.
        drawing: Boolean(current[at + 1]?.imageUrl) && !edited.imageUrl,
        history: before,
      });
    },
    [run, thinking, user?.id],
  );


  const reset = useCallback(() => {
    setMessages([]);
    setInput("");
    setPendingImage(null);
    setImageMode(false);
    historyRef.current = [];
    conversationRef.current = null;
    setConversationId(null);
  }, []);


  const openConversation = useCallback(
    async (id: string) => {
      if (!workspaceId) return;
      try {
        const convo = await fetchConversation({ workspaceId, conversationId: id }).unwrap();
        const restored: OrbitMessage[] = convo.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          imageUrl: m.imageUrl,
          failed: m.failed || undefined,
          suggestions: m.suggestions.length ? m.suggestions : undefined,
          dataDigest: m.dataDigest,
          digestAt: m.createdAt,
          modelLabel: m.modelLabel,
        }));
        setMessages(restored);
        historyRef.current = restored;
        conversationRef.current = convo.id;
        setConversationId(convo.id);
        setInput("");
        setPendingImage(null);
      } catch {
        // Deleted in another tab, most likely. Leaving the panel on what it was
        // showing is better than blanking it over a thread that is gone.
      }
    },
    [fetchConversation, workspaceId],
  );

  const removeSaved = useCallback(
    async (id: string) => {
      if (!workspaceId) return;
      await removeConversation({ workspaceId, conversationId: id }).unwrap();
      setConversationPages((prev) => prev.filter((c) => c.id !== id));
      if (conversationRef.current === id) reset();
    },
    [removeConversation, workspaceId, reset],
  );

  const bulkRemoveSaved = useCallback(
    async (ids: string[]) => {
      if (!workspaceId || !ids.length) return;
      await bulkRemoveConversations({ workspaceId, ids }).unwrap();
      const removed = new Set(ids);
      setConversationPages((prev) => prev.filter((c) => !removed.has(c.id)));
      if (conversationRef.current && removed.has(conversationRef.current)) reset();
    },
    [bulkRemoveConversations, workspaceId, reset],
  );

  const renameSaved = useCallback(
    async (id: string, title: string) => {
      if (!workspaceId) return;
      await renameConversationMutation({ workspaceId, conversationId: id, title }).unwrap();
      setConversationPages((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
    },
    [renameConversationMutation, workspaceId],
  );

  return {
    messages,
    input,
    setInput,
    /** An image staged for the next question, as a data URL. Null when none. */
    pendingImage,
    /** Stage or clear the image for the next question. */
    attachImage: setPendingImage,
    /** Whether the next question draws a picture instead of answering one. */
    imageMode,
    setImageMode,
    send,
    reset,

    regenerateLast,

    editAndResend,
    stop,
    thinking,
    generatingImage,
    available: status?.configured ?? true,
    started: messages.length > 0,
    models,
    model: activeModel,
    setModel,

    /** The workspace's Orbit plan, for the quota line and the upgrade prompt. */
    plan: status?.plan ?? null,
    /** Questions left this cycle. Null until an answer reports it. */
    remaining,
    conversations: conversationPages,
    loadingConversations,
    loadingMoreConversations,
    hasMoreConversations,
    /** Fetch the next page and append it to `conversations`. */
    loadMoreConversations,
    /** Load the first page, once, when something is about to show the list.
     * Nothing fetches it on mount — see the effect that resets it. */
    ensureConversationsLoaded,
    /** The thread on screen, when it has been saved. Null on an unsaved one. */
    conversationId,
    /** True while a past thread is being pulled in, for the sidebar's spinner. */
    loadingConversation,
    openConversation,
    deleteConversation: removeSaved,
    /** Remove several saved threads at once. */
    deleteConversations: bulkRemoveSaved,
    renameConversation: renameSaved,
  };
}
