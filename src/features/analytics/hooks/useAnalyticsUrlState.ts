import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { CompareMode, StatsFilter } from "@/shared/types";
import type { RangeState } from "@/features/analytics/components/RangePicker";
import type { CompareState } from "@/features/analytics/components/ComparePicker";

const DEFAULT_RANGE = "24h";
const DEFAULT_COMPARE: CompareMode = "previous";
const DEFAULT_SECTION = "overview";
const DEFAULT_TAB = "pages";
const COMPARE_MODES: CompareMode[] = ["previous", "yoy", "custom"];
const PRESETS = ["1h", "24h", "7d", "30d", "custom"];

const FILTER_KEYS: (keyof StatsFilter)[] = [
  "country", "device", "browser", "os", "referrer", "path", "language",
  "utmSource", "utmMedium", "utmCampaign", "eventName",
];

const RANGE_KEYS = ["range", "from", "to"];
const COMPARE_KEYS = ["compare", "compareFrom"];

type Updater<T> = T | ((prev: T) => T);

function readFilter(params: URLSearchParams): StatsFilter {
  const out: StatsFilter = {};
  for (const key of FILTER_KEYS) {
    const value = params.get(key);
    if (value) out[key] = value;
  }
  return out;
}

function writeEntries(out: URLSearchParams, entries: Record<string, string | undefined>, defaults: Record<string, string> = {}) {
  for (const [key, value] of Object.entries(entries)) {
    if (!value || value === defaults[key]) out.delete(key);
    else out.set(key, value);
  }
}

export function useAnalyticsUrlState(allowedRanges?: readonly string[]) {
  const [params, setParams] = useSearchParams();

  const isAllowed = useCallback(
    (preset: string) => PRESETS.includes(preset) && (!allowedRanges || allowedRanges.includes(preset)),
    [allowedRanges],
  );

  const rawPreset = params.get("range") ?? DEFAULT_RANGE;
  const preset = isAllowed(rawPreset) ? rawPreset : DEFAULT_RANGE;
  const from = preset === "custom" ? params.get("from") ?? undefined : undefined;
  const to = preset === "custom" ? params.get("to") ?? undefined : undefined;
  const rangeState = useMemo<RangeState>(
    () => (preset === "custom" && from && to ? { preset, from, to } : { preset: preset === "custom" ? DEFAULT_RANGE : preset }),
    [preset, from, to],
  );

  const rawMode = params.get("compare") as CompareMode | null;
  const mode = rawMode && COMPARE_MODES.includes(rawMode) ? rawMode : DEFAULT_COMPARE;
  const compareFrom = mode === "custom" ? params.get("compareFrom") ?? undefined : undefined;
  const compareState = useMemo<CompareState>(
    () => (compareFrom ? { mode, from: compareFrom } : { mode }),
    [mode, compareFrom],
  );

  const filterKey = new URLSearchParams(
    FILTER_KEYS.flatMap((k) => {
      const value = params.get(k);
      return value ? [[k, value]] : [];
    }),
  ).toString();
  const filter = useMemo(() => readFilter(new URLSearchParams(filterKey)), [filterKey]);

  const section = params.get("section") ?? DEFAULT_SECTION;
  const tab = params.get("tab") ?? DEFAULT_TAB;

  const update = useCallback(
    (apply: (out: URLSearchParams) => void) =>
      setParams(
        (prev) => {
          const out = new URLSearchParams(prev);
          apply(out);
          return out;
        },
        { replace: true },
      ),
    [setParams],
  );

  const setRangeState = useCallback(
    (next: RangeState) =>
      update((out) => {
        RANGE_KEYS.forEach((k) => out.delete(k));
        writeEntries(
          out,
          { range: next.preset, from: next.from, to: next.to },
          { range: DEFAULT_RANGE },
        );
      }),
    [update],
  );

  const setCompareState = useCallback(
    (next: CompareState) =>
      update((out) => {
        COMPARE_KEYS.forEach((k) => out.delete(k));
        writeEntries(out, { compare: next.mode, compareFrom: next.from }, { compare: DEFAULT_COMPARE });
      }),
    [update],
  );

  const setFilter = useCallback(
    (next: Updater<StatsFilter>) =>
      update((out) => {
        const current = readFilter(out);
        const resolved = typeof next === "function" ? next(current) : next;
        FILTER_KEYS.forEach((k) => out.delete(k));
        writeEntries(out, resolved as Record<string, string | undefined>);
      }),
    [update],
  );

  const setView = useCallback(
    (nextSection: string, nextTab?: string) =>
      update((out) =>
        writeEntries(
          out,
          { section: nextSection, tab: nextTab },
          { section: DEFAULT_SECTION, tab: DEFAULT_TAB },
        ),
      ),
    [update],
  );

  const setTab = useCallback(
    (nextTab: string) => update((out) => writeEntries(out, { tab: nextTab }, { tab: DEFAULT_TAB })),
    [update],
  );

  return {
    rangeState,
    setRangeState,
    compareState,
    setCompareState,
    filter,
    setFilter,
    section,
    tab,
    setView,
    setTab,
  };
}
