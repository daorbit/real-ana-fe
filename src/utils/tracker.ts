import { API_ORIGIN } from "../api";

/**
 * Optional tracker behaviour, mirroring the `data-*` attributes read by
 * public/tracker.js. Every field is off/empty by default, so a snippet built
 * with no options is byte-for-byte what it was before these existed.
 */
export type TrackerOptions = {
  /** Skip visitors whose browser sends Do Not Track. */
  dnt?: boolean;
  /** Report `#/route` as `/route`, for hash-based routers. */
  hash?: boolean;
  /** Turn off click tracking. */
  clicks?: boolean;
  /** Turn off JavaScript error tracking. */
  errors?: boolean;
  /** Path globs to never report, e.g. `["/admin/*"]`. */
  ignorePages?: string[];
  /** Query params to keep on the reported path. All others are dropped. */
  allowParams?: string[];
  /** Report a different hostname — staging folding into production. */
  domain?: string;
};

/**
 * The attributes for a snippet, in the order they should be written.
 *
 * `clicks` and `errors` are on by default in the tracker and are expressed as
 * an explicit "off", so they only appear when actually disabled.
 */
function attributes(siteId: string, o: TrackerOptions = {}): [string, string][] {
  const attrs: [string, string][] = [["data-site", siteId]];

  if (o.dnt) attrs.push(["data-dnt", "on"]);
  if (o.hash) attrs.push(["data-hash", "on"]);
  if (o.clicks === false) attrs.push(["data-clicks", "off"]);
  if (o.errors === false) attrs.push(["data-errors", "off"]);

  const ignore = (o.ignorePages ?? []).map((s) => s.trim()).filter(Boolean);
  if (ignore.length) attrs.push(["data-ignore-pages", ignore.join(",")]);

  const params = (o.allowParams ?? []).map((s) => s.trim()).filter(Boolean);
  if (params.length) attrs.push(["data-allow-params", params.join(",")]);

  const domain = (o.domain ?? "").trim();
  if (domain) attrs.push(["data-domain", domain]);

  return attrs;
}

/** The exact snippet a customer pastes into their site's <head>. */
export function trackingSnippet(siteId: string, options: TrackerOptions = {}): string {
  const attrs = attributes(siteId, options)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");
  return `<script async src="${API_ORIGIN}/tracker.js" ${attrs}></script>`;
}

/** The same snippet, wrapped across lines so it reads well in a code block. */
export function trackingSnippetPretty(siteId: string, options: TrackerOptions = {}): string {
  return [
    "<script",
    "  async",
    `  src="${API_ORIGIN}/tracker.js"`,
    ...attributes(siteId, options).map(([k, v]) => `  ${k}="${v}"`),
    "></script>",
  ].join("\n");
}
