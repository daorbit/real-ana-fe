import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDesignDashboardMutation } from "@/features/dashboards/api";
import { errMessage } from "@/shared/lib/notify";
import type { DashboardDraft, DashboardOrbitMode } from "@/features/dashboards/types";

export type DashboardOrbitMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  failed?: boolean;
  stopped?: boolean;
  draft?: DashboardDraft;
  base?: DashboardDraft;
  suggestions?: string[];
  version?: number;
};

export type DashboardOrbit = ReturnType<typeof useDashboardOrbit>;

let seq = 0;
const nextId = () => `do-${Date.now()}-${++seq}`;

function draftOf(list: DashboardOrbitMessage[], focusId: string | null): DashboardDraft | undefined {
  const focused = focusId ? list.find((m) => m.id === focusId)?.draft : undefined;
  if (focused) return focused;
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].draft) return list[i].draft;
  }
  return undefined;
}

export function useDashboardOrbit({
  workspaceId,
  mode,
  base,
  scope,
  focusId = null,
}: {
  workspaceId: string | undefined;
  mode: DashboardOrbitMode;
  base?: DashboardDraft;
  scope: string;
  focusId?: string | null;
}) {
  const [design] = useDesignDashboardMutation();
  const [messages, setMessages] = useState<DashboardOrbitMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const [liveId, setLiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const inflight = useRef<{ abort: () => void } | null>(null);
  const reveal = useRef<string | null>(null);

  const reset = () => {
    inflight.current?.abort();
    inflight.current = null;
    setMessages([]);
    setThinking(false);
    setLiveId(null);
    setInput("");
  };

  const scoped = useRef(scope);
  useEffect(() => {
    if (scoped.current === scope) return;
    scoped.current = scope;
    reset();
  }, [scope]);

  useLayoutEffect(() => {
    if (!reveal.current) return;
    setLiveId(reveal.current);
    reveal.current = null;
  }, [messages]);

  const run = async (prompt: string, prior: DashboardOrbitMessage[]) => {
    if (!workspaceId) return;
    const current = draftOf(prior, focusId) ?? base;
    const version = prior.filter((m) => m.draft).length + 1;
    const history = prior
      .filter((m) => !m.failed && !m.stopped)
      .slice(-8)
      .map(({ role, content }) => ({ role, content }));
    setMessages([...prior, { id: nextId(), role: "user", content: prompt }]);
    setThinking(true);

    const request = design({ workspaceId, prompt, mode, current, history });
    inflight.current = request;

    try {
      const { reply, draft, suggestions } = await request.unwrap();
      if (inflight.current !== request) return;
      const id = nextId();
      reveal.current = id;
      setMessages((prev) => [
        ...prev,
        { id, role: "assistant", content: reply, draft, base: current, suggestions, version },
      ]);
    } catch (e) {
      if (inflight.current !== request) return;
      const aborted = (e as { name?: string })?.name === "AbortError";
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          content: aborted ? "" : errMessage(e, "Orbit couldn't build that right now."),
          failed: !aborted,
          stopped: aborted,
        },
      ]);
    } finally {
      if (inflight.current === request) {
        inflight.current = null;
        setThinking(false);
      }
    }
  };

  const send = (text?: string) => {
    const prompt = (text ?? input).trim();
    if (!prompt || thinking) return;
    setInput("");
    void run(prompt, messages);
  };

  const start = (prompt: string) => {
    const text = prompt.trim();
    if (!text) return;
    inflight.current?.abort();
    setInput("");
    setLiveId(null);
    void run(text, []);
  };

  const regenerateLast = () => {
    if (thinking) return;
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    void run(lastUser.content, messages.slice(0, messages.lastIndexOf(lastUser)));
  };

  const editAndResend = (id: string, text: string) => {
    if (thinking) return;
    const index = messages.findIndex((m) => m.id === id);
    if (index < 0) return;
    void run(text, messages.slice(0, index));
  };

  const versions = messages.filter((m): m is DashboardOrbitMessage & { draft: DashboardDraft } => Boolean(m.draft));

  return {
    mode,
    messages,
    versions,
    latestVersionId: versions[versions.length - 1]?.id ?? null,
    thinking,
    started: messages.length > 0 || thinking,
    input,
    setInput,
    liveId,
    clearLive: () => setLiveId(null),
    send,
    start,
    regenerateLast,
    editAndResend,
    stop: () => inflight.current?.abort(),
    reset,
  };
}
