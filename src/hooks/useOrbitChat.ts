import { useCallback, useRef, useState } from "react";
import { useAskOrbitMutation, useGetOrbitStatusQuery } from "../store";
import { errMessage } from "../notify";

/**
 * The Orbit conversation.
 *
 * Held in React state, not on the server and not in storage. A support chat is
 * a thing you have while stuck and do not come back to, and keeping it in
 * memory means there is no transcript to retain, expire or hand over — the
 * privacy question never arises because the data never lands anywhere.
 *
 * The consequence, which the UI should not hide: a refresh loses the thread.
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
};

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
  const { data: status } = useGetOrbitStatusQuery();

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
      if (!question || thinking) return;

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
        const { reply, suggestions } = await ask({ question, history }).unwrap();
        setMessages((prev) => {
          const next = [
            ...prev,
            { id: nextId(), role: "assistant" as const, content: reply, suggestions },
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
    [ask, input, thinking],
  );

  const reset = useCallback(() => {
    setMessages([]);
    setInput("");
    historyRef.current = [];
  }, []);

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
  };
}
