import { API_ORIGIN } from "@/shared/lib/http";
import type { Experiment, ExperimentInput, ExperimentVariant } from "@/features/experiments/types";

export const VARIANT_KEYS = ["control", "b", "c", "d"] as const;
export const MAX_VARIANTS = VARIANT_KEYS.length;

function variant(index: number, weight: number): ExperimentVariant {
  return {
    key: VARIANT_KEYS[index],
    name: index === 0 ? "Original" : `Variant ${VARIANT_KEYS[index].toUpperCase()}`,
    weight,
    redirectUrl: "",
    changes: index === 0 ? [] : [{ selector: "", action: "text", attr: "", value: "" }],
  };
}

export function emptyDraft(siteId: string): ExperimentInput {
  return {
    name: "",
    siteId,
    key: "",
    type: "changes",
    pages: { mode: "include", patterns: [] },
    devices: "all",
    goal: { type: "page", value: "" },
    variants: [variant(0, 50), variant(1, 50)],
  };
}

export function draftFrom(experiment: Experiment): ExperimentInput {
  const { name, siteId, key, type, pages, devices, goal, variants } = experiment;
  return { name, siteId, key, type, pages, devices, goal, variants };
}

export function evenWeights(count: number): number[] {
  const base = Math.floor(100 / count);
  return Array.from({ length: count }, (_, i) => (i === 0 ? 100 - base * (count - 1) : base));
}

export function withVariantCount(variants: ExperimentVariant[], count: number): ExperimentVariant[] {
  const weights = evenWeights(count);
  return Array.from({ length: count }, (_, i) => ({ ...(variants[i] ?? variant(i, weights[i])), key: VARIANT_KEYS[i], weight: weights[i] }));
}

export function totalWeight(variants: ExperimentVariant[]): number {
  return variants.reduce((sum, v) => sum + (Number(v.weight) || 0), 0);
}

export function draftProblem(draft: ExperimentInput): string | null {
  if (!draft.name.trim()) return "Give the test a name.";
  if (!draft.siteId) return "Pick a site.";
  if (draft.pages.mode !== "all" && !draft.pages.patterns.length) return "Add at least one page.";
  if (!draft.goal.value.trim()) return "Pick the goal visitors should reach.";
  if (draft.goal.type === "page" && !draft.goal.value.startsWith("/")) return "A goal page starts with /.";
  if (totalWeight(draft.variants) !== 100) return "Variant shares must add up to 100%.";
  for (const v of draft.variants.slice(1)) {
    if (draft.type === "split" && !v.redirectUrl.trim()) return `${v.name} needs a page to send visitors to.`;
    if (draft.type === "changes") {
      if (!v.changes.length) return `${v.name} needs at least one change.`;
      if (v.changes.some((c) => !c.selector.trim())) return `Every change in ${v.name} needs a CSS selector.`;
      if (v.changes.some((c) => c.action !== "hide" && !c.value.trim())) return `Every change in ${v.name} needs a value.`;
    }
  }
  return null;
}

export function optInSnippet(siteId: string): string {
  return `<script async src="${API_ORIGIN}/tracker.js" data-site="${siteId || "YOUR_SITE_ID"}" data-experiments="on"></script>`;
}

export function codeSample(key: string): string {
  return `rta.variant("${key || "your-test-key"}", function (variant) {\n  if (variant === "b") {\n    document.querySelector(".hero-title").textContent = "Your new headline";\n  }\n});`;
}
