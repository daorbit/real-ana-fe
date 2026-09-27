import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAskSearchOrbitMutation } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import type { SearchType } from "@/shared/types";

export type SearchOrbitMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode?: "summary" | "question";
  failed?: boolean;
  stopped?: boolean;
};

export type SearchOrbitChat = ReturnType<typeof useSearchOrbitChat>;

const SUMMARY_PROMPT = "Summarize my search performance and tell me what to do next.";

let seq = 0;
const nextId = () => `so-${Date.now()}-${++seq}`;

export function useSearchOrbitChat(ctx: {
  workspaceId: string;
  siteId: string;
  days: number;
  type: SearchType;
  pageUrl?: string;
}) {
  const [ask] = useAskSearchOrbitMutation();
  const [messages, setMessages] = useState<SearchOrbitMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const [liveId, setLiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const inflight = useRef<{ abort: () => void } | null>(null);
  const reveal = useRef<string | null>(null);
  const scope = `${ctx.siteId}:${ctx.days}:${ctx.type}:${ctx.pageUrl ?? ""}`;

  const reset = () => {
    inflight.current?.abort();
    inflight.current = null;
    setMessages([]);
    setThinking(false);
    setLiveId(null);
  };

  useEffect(reset, [scope]);

  useLayoutEffect(() => {
    if (!reveal.current) return;
    setLiveId(reveal.current);
    reveal.current = null;
  }, [messages]);

  const run = async (question: string, mode: "summary" | "question", base: SearchOrbitMessage[]) => {
    const history = base
      .filter((m) => !m.failed && !m.stopped)
      .slice(-6)
      .map(({ role, content }) => ({ role, content }));
    setMessages([...base, { id: nextId(), role: "user", content: question, mode }]);
    setThinking(true);

    const request = ask({
      ...ctx,
      mode,
      question: mode === "question" ? question : undefined,
      history: mode === "question" ? history : undefined,
    });
    inflight.current = request;

    try {
      const { reply } = await request.unwrap();
      const id = nextId();
      reveal.current = id;
      setMessages((prev) => [...prev, { id, role: "assistant", content: reply }]);
    } catch (e) {
      const aborted = (e as { name?: string })?.name === "AbortError";
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          content: aborted ? "" : errMessage(e, "Orbit couldn't answer that right now."),
          failed: !aborted,
          stopped: aborted,
        },
      ]);
    } finally {
      if (inflight.current === request) inflight.current = null;
      setThinking(false);
    }
  };

  const send = (text?: string) => {
    const question = (text ?? input).trim();
    if (!question || thinking) return;
    setInput("");
    void run(question, "question", messages);
  };

  const summarize = () => {
    if (thinking) return;
    void run(SUMMARY_PROMPT, "summary", messages);
  };

  const regenerateLast = () => {
    if (thinking) return;
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    const base = messages.slice(0, messages.lastIndexOf(lastUser));
    void run(lastUser.content, lastUser.mode ?? "question", base);
  };

  const editAndResend = (id: string, text: string) => {
    if (thinking) return;
    const index = messages.findIndex((m) => m.id === id);
    if (index < 0) return;
    void run(text, "question", messages.slice(0, index));
  };

  const stop = () => inflight.current?.abort();

  return {
    messages,
    thinking,
    started: messages.length > 0 || thinking,
    input,
    setInput,
    liveId,
    clearLive: () => setLiveId(null),
    send,
    summarize,
    regenerateLast,
    editAndResend,
    stop,
    reset,
  };
}
