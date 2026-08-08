/**
 * Barrel for the SEO report panels.
 *
 * The panels were one 1,700-line file; they now live under `panels/` (one tab
 * each), with the pieces they share in `shared/`, pure helpers in `utils.ts`
 * and derived issue data in `hooks.ts`. This re-export keeps the original
 * import path (`components/seo/SeoPanels`) working for every consumer.
 */
export { OverviewPanel } from "@/features/seo/components/panels/OverviewPanel";
export { IssueList, ScorePanel } from "@/features/seo/components/panels/IssueList";
export { MetaPanel } from "@/features/seo/components/panels/MetaPanel";
export { ContentPanel } from "@/features/seo/components/panels/ContentPanel";
export { TechnicalPanel } from "@/features/seo/components/panels/TechnicalPanel";
export { SuggestionsPanel } from "@/features/seo/components/panels/SuggestionsPanel";
