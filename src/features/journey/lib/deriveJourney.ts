import type { JourneyEvent } from "@/shared/types";

/** What the filter bar controls, and what every view reads from. */
export type JourneyFilters = {
  /** Actions to keep. Empty means "all of them" — the default, not "none". */
  actions: string[];
  /** Free-text match across action, src and dest. */
  search: string;
  /** ISO date strings bounding the window, or null for "no bound". */
  from: string | null;
  to: string | null;
  /** Fold consecutive identical actions into one row with a count. */
  collapseRepeats: boolean;
};

export const EMPTY_FILTERS: JourneyFilters = {
  actions: [],
  search: "",
  from: null,
  to: null,
  collapseRepeats: false,
};

/**
 * A journey step after filtering — the original event plus what folding it
 * revealed. `repeats` is 1 for an ordinary step and N for a collapsed run,
 * and `index` is the position in the *filtered* list so the diagrams and the
 * JSON panel agree on what "step 4" means.
 */
export type JourneyStep = JourneyEvent & {
  index: number;
  repeats: number;
  /** Milliseconds since the previous step, or null for the first one. */
  sincePrev: number | null;
};

/** One visit: the steps that share a session id, in order. */
export type JourneySession = {
  id: string;
  steps: JourneyStep[];
  startedAt: string;
  endedAt: string;
  /** Wall-clock length of the visit, in milliseconds. */
  durationMs: number;
};

/** Every distinct action in the raw feed, most frequent first. */
export function actionOptions(events: JourneyEvent[]): { value: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const e of events) counts.set(e.action, (counts.get(e.action) ?? 0) + 1);
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Apply the filter bar to the raw feed.
 *
 * Order matters: filter first, then collapse — collapsing first would fold
 * two steps that a filter was about to separate, and the count would be a
 * lie about a run that never happened.
 */
export function applyFilters(events: JourneyEvent[], f: JourneyFilters): JourneyStep[] {
  const needle = f.search.trim().toLowerCase();
  const fromMs = f.from ? new Date(f.from).getTime() : null;
  const toMs = f.to ? new Date(f.to).getTime() : null;

  const kept = events.filter((e) => {
    if (f.actions.length && !f.actions.includes(e.action)) return false;

    if (needle) {
      const hay = `${e.action} ${e.src} ${e.dest}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }

    const at = new Date(e.ts).getTime();
    if (fromMs !== null && at < fromMs) return false;
    // The "to" bound is inclusive of the whole day the picker names, which is
    // what someone choosing a date means by it.
    if (toMs !== null && at > toMs + 24 * 60 * 60 * 1000 - 1) return false;

    return true;
  });

  const steps: JourneyStep[] = [];
  for (const e of kept) {
    const prev = steps[steps.length - 1];

    if (
      f.collapseRepeats &&
      prev &&
      prev.action === e.action &&
      prev.src === e.src &&
      prev.dest === e.dest
    ) {
      // Folded into the run above: the run's timestamp stays its *first*
      // occurrence, so the order of the list is still the order things
      // happened.
      prev.repeats += 1;
      continue;
    }

    steps.push({
      ...e,
      index: steps.length,
      repeats: 1,
      sincePrev: prev ? new Date(e.ts).getTime() - new Date(prev.ts).getTime() : null,
    });
  }

  return steps;
}

/**
 * Group filtered steps into sessions.
 *
 * Uses the tracker's own session id where there is one. Steps that arrived
 * without one (an older SDK, a server-side call) fall back to a single
 * "unknown" bucket rather than being dropped — a step with no session is
 * still something the user did.
 */
export function groupSessions(steps: JourneyStep[]): JourneySession[] {
  const sessions: JourneySession[] = [];

  for (const step of steps) {
    const id = step.sessionId || "unknown";
    const open = sessions[sessions.length - 1];

    if (open && open.id === id) {
      open.steps.push(step);
      open.endedAt = step.ts;
      open.durationMs = new Date(step.ts).getTime() - new Date(open.startedAt).getTime();
      continue;
    }

    sessions.push({
      id,
      steps: [step],
      startedAt: step.ts,
      endedAt: step.ts,
      durationMs: 0,
    });
  }

  return sessions;
}

/** "4s", "2m 10s", "1h 3m" — a gap, in the largest units that stay honest. */
export function gapLabel(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return s % 60 ? `${m}m ${s % 60}s` : `${m}m`;
  const h = Math.floor(m / 60);
  return m % 60 ? `${h}h ${m % 60}m` : `${h}h`;
}
