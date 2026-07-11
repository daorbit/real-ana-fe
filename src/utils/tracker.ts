import { API_ORIGIN } from "../api";

/** The exact snippet a customer pastes into their site's <head>. */
export function trackingSnippet(siteId: string): string {
  return `<script async src="${API_ORIGIN}/tracker.js" data-site="${siteId}"></script>`;
}

export const FRAMEWORKS = ["react", "vue", "angular", "svelte", "other"] as const;
export type Framework = (typeof FRAMEWORKS)[number];

/** Brand colour for each framework, used by the little dot in site rows. */
export const FRAMEWORK_COLORS: Record<string, string> = {
  react: "#61dafb",
  vue: "#42b883",
  angular: "#dd0031",
  svelte: "#ff3e00",
  other: "#98a2b3",
};
