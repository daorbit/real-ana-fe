import { useEffect, useRef, useState } from "react";
import { useComputeFunnelMutation } from "@/app/store";
import { useDemo } from "@/features/demo/context";
import { demoFunnelReport } from "@/features/demo/demoFunnels";
import { notifyError } from "@/shared/lib/notify";
import type { FunnelReport } from "@/shared/types";
import type { RangeState } from "@/features/analytics/components/RangePicker";
import { filledSteps, MIN_STEPS, stepsKey, type Draft } from "../lib/funnelDraft";

const DEBOUNCE_MS = 400;

export type FunnelRun = { key: string; report: FunnelReport };

export function useFunnelRun(
  workspaceId: string | undefined,
  steps: Draft[],
  range: RangeState,
  sites: string[],
  compare: boolean,
) {
  const { demo } = useDemo();
  const [run] = useComputeFunnelMutation();
  const [result, setResult] = useState<FunnelRun | null>(null);
  const [running, setRunning] = useState(false);
  const ticket = useRef(0);
  const latest = useRef({ steps, sites });
  latest.current = { steps, sites };

  const key = stepsKey(steps);
  const sitesKey = sites.join(",");

  useEffect(() => {
    const current = ++ticket.current;
    const payload = filledSteps(latest.current.steps);

    if (!workspaceId || payload.length < MIN_STEPS) {
      setRunning(false);
      setResult(null);
      return;
    }
    if (demo) {
      const report = demoFunnelReport(payload, range.preset);
      setResult({ key, report: compare ? report : { ...report, previous: null } });
      return;
    }

    setRunning(true);
    const timer = window.setTimeout(async () => {
      try {
        const report = await run({
          workspaceId,
          steps: payload,
          range: range.preset,
          sites: latest.current.sites,
          from: range.from,
          to: range.to,
          compare,
        }).unwrap();
        if (current === ticket.current) setResult({ key, report });
      } catch (e) {
        if (current === ticket.current) notifyError(e, "Could not compute the funnel.");
      } finally {
        if (current === ticket.current) setRunning(false);
      }
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [key, sitesKey, range.preset, range.from, range.to, compare, workspaceId, demo, run]);

  const report = result && result.key === key ? result.report : null;
  return { report, running };
}
