/**
 * Barrel for the SEO report panels.
 *
 * The panels were one 1,700-line file; they now live under `panels/` (one tab
 * each), with the pieces they share in `shared/`, pure helpers in `utils.ts`
 * and derived issue data in `hooks.ts`. This re-export keeps the original
 * import path (`components/seo/SeoPanels`) working for every consumer.
 */
export { OverviewPanel } from "./panels/OverviewPanel";
export { IssueList, ScorePanel } from "./panels/IssueList";
export { MetaPanel } from "./panels/MetaPanel";
export { ContentPanel } from "./panels/ContentPanel";
export { TechnicalPanel } from "./panels/TechnicalPanel";
export { SuggestionsPanel } from "./panels/SuggestionsPanel";
