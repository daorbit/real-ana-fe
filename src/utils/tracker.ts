import { API_ORIGIN } from "../api";

/** The exact snippet a customer pastes into their site's <head>. */
export function trackingSnippet(siteId: string): string {
  return `<script async src="${API_ORIGIN}/tracker.js" data-site="${siteId}"></script>`;
}

/** The same snippet, wrapped across lines so it reads well in a code block. */
export function trackingSnippetPretty(siteId: string): string {
  return [
    "<script",
    `  async`,
    `  src="${API_ORIGIN}/tracker.js"`,
    `  data-site="${siteId}"`,
    "></script>",
  ].join("\n");
}
