import { useCallback, useState } from "react";
import { useAskSearchOrbitMutation } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import { useOrbitOptional } from "@/features/orbit/components/OrbitProvider";
import type { SearchType } from "@/shared/types";
import type { MetricKey } from "./searchMetrics";

export type ExplainProps = {
  onExplain?: () => void;
  explaining?: boolean;
  explanation?: string | null;
  explainError?: string | null;
};

export function useSearchOrbitExplain(ctx: {
  workspaceId: string;
  siteId: string;
  days: number;
  type: SearchType;
  pageUrl?: string;
}) {
  const available = Boolean(useOrbitOptional()?.chat.available);
  const [ask] = useAskSearchOrbitMutation();
  const [answers, setAnswers] = useState<Record<string, { text?: string; error?: string }>>({});
  const [pending, setPending] = useState<string | null>(null);
  const scope = `${ctx.days}:${ctx.type}:${ctx.pageUrl ?? ""}`;

  const run = useCallback(
    async (metric: MetricKey) => {
      const key = `${metric}:${scope}`;
      if (answers[key] || pending === key) return;
      setPending(key);
      try {
        const { reply } = await ask({ ...ctx, mode: "metric", metric }).unwrap();
        setAnswers((prev) => ({ ...prev, [key]: { text: reply } }));
      } catch (e) {
        setAnswers((prev) => ({ ...prev, [key]: { error: errMessage(e, "Orbit couldn't explain this right now.") } }));
      } finally {
        setPending((cur) => (cur === key ? null : cur));
      }
    },
    [answers, pending, scope, ask, ctx],
  );

  return (metric: MetricKey): ExplainProps => {
    if (!available) return {};
    const key = `${metric}:${scope}`;
    return {
      onExplain: () => void run(metric),
      explaining: pending === key,
      explanation: answers[key]?.text ?? null,
      explainError: answers[key]?.error ?? null,
    };
  };
}
