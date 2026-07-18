import { trackingSnippet, trackingSnippetPretty, type TrackerOptions } from "./tracker";

/**
 * Install guidance per framework.
 *
 * The tracker is the same script everywhere — what differs is where a given
 * framework wants a third-party tag to live, and whether it can take raw HTML
 * at all. Anything that renders a plain `<head>` shares the HTML snippet;
 * frameworks with their own script primitive (Next.js) or no HTML entry point
 * (React, Vue) get code that suits them.
 */
export type FrameworkId =
  | "html"
  | "nextjs"
  | "react"
  | "vue"
  | "wordpress"
  | "webflow"
  | "shopify"
  | "other";

export type FrameworkGuide = {
  id: FrameworkId;
  label: string;
  /** Where the snippet goes, in the user's own terms. */
  placement: string;
  /** Filename shown on the code block. */
  filename: string;
  /** Anything worth knowing after pasting — deploy steps, gotchas. */
  note?: string;
  /** Builds the snippet for this framework. */
  code: (siteId: string, options: TrackerOptions) => string;
};

/**
 * The tracker's own attributes, as a JS object literal — for frameworks that
 * build the script element rather than writing HTML.
 */
function datasetLines(options: TrackerOptions, indentBy: number): string {
  const pad = " ".repeat(indentBy);
  const lines: string[] = [];

  if (options.dnt) lines.push(`${pad}s.dataset.dnt = "on";`);
  if (options.hash) lines.push(`${pad}s.dataset.hash = "on";`);
  if (options.clicks === false) lines.push(`${pad}s.dataset.clicks = "off";`);
  if (options.errors === false) lines.push(`${pad}s.dataset.errors = "off";`);

  const ignore = (options.ignorePages ?? []).filter(Boolean);
  if (ignore.length) lines.push(`${pad}s.dataset.ignorePages = "${ignore.join(",")}";`);

  const params = (options.allowParams ?? []).filter(Boolean);
  if (params.length) lines.push(`${pad}s.dataset.allowParams = "${params.join(",")}";`);

  const domain = (options.domain ?? "").trim();
  if (domain) lines.push(`${pad}s.dataset.domain = "${domain}";`);

  return lines.length ? "\n" + lines.join("\n") : "";
}

/** JSX props form, for Next.js's <Script> component. */
function jsxProps(options: TrackerOptions, indentBy: number): string {
  const pad = " ".repeat(indentBy);
  const props: string[] = [];

  if (options.dnt) props.push(`${pad}data-dnt="on"`);
  if (options.hash) props.push(`${pad}data-hash="on"`);
  if (options.clicks === false) props.push(`${pad}data-clicks="off"`);
  if (options.errors === false) props.push(`${pad}data-errors="off"`);

  const ignore = (options.ignorePages ?? []).filter(Boolean);
  if (ignore.length) props.push(`${pad}data-ignore-pages="${ignore.join(",")}"`);

  const params = (options.allowParams ?? []).filter(Boolean);
  if (params.length) props.push(`${pad}data-allow-params="${params.join(",")}"`);

  const domain = (options.domain ?? "").trim();
  if (domain) props.push(`${pad}data-domain="${domain}"`);

  return props.length ? "\n" + props.join("\n") : "";
}

export const FRAMEWORKS: FrameworkGuide[] = [
  {
    id: "html",
    label: "HTML",
    placement: "Paste just before the closing </head> tag.",
    filename: "index.html",
    code: (siteId, options) => trackingSnippetPretty(siteId, options),
  },
  {
    id: "nextjs",
    label: "Next.js",
    placement: "Add to your root layout, inside <head>.",
    filename: "app/layout.tsx",
    note: "Works with both the App Router and Pages Router. Keep the site ID in an env var so preview deploys can point elsewhere.",
    code: (siteId, options) => `import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src="${trackerSrc()}"
          data-site="${siteId}"${jsxProps(options, 10)}
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}`,
  },
  {
    id: "react",
    label: "React",
    placement: "Mount once at your app root, or paste the HTML tag into public/index.html.",
    filename: "App.tsx",
    note: "The cleanup removes the script on unmount, which matters in development where React mounts twice under Strict Mode.",
    code: (siteId, options) => `import { useEffect } from "react";

useEffect(() => {
  const s = document.createElement("script");
  s.src = "${trackerSrc()}";
  s.async = true;
  s.dataset.site = "${siteId}";${datasetLines(options, 2)}
  document.head.appendChild(s);
  return () => { document.head.removeChild(s); };
}, []);`,
  },
  {
    id: "vue",
    label: "Vue",
    placement: "Add to your app entry point, before mount.",
    filename: "main.ts",
    code: (siteId, options) => `const s = document.createElement("script");
s.src = "${trackerSrc()}";
s.async = true;
s.dataset.site = "${siteId}";${datasetLines(options, 0)}
document.head.appendChild(s);`,
  },
  {
    id: "wordpress",
    label: "WordPress",
    placement: "Appearance → Theme File Editor → header.php, before </head>. Or paste it into any 'header scripts' box your theme or an SEO plugin provides.",
    filename: "header.php",
    note: "Editing header.php directly is overwritten by theme updates — a child theme or a header-scripts plugin survives them.",
    code: (siteId, options) => trackingSnippetPretty(siteId, options),
  },
  {
    id: "webflow",
    label: "Webflow",
    placement: "Site settings → Custom code → Head code.",
    filename: "Head code",
    note: "Custom code only runs on published sites, not in the Designer preview.",
    code: (siteId, options) => trackingSnippetPretty(siteId, options),
  },
  {
    id: "shopify",
    label: "Shopify",
    placement: "Online Store → Themes → Edit code → layout/theme.liquid, before </head>.",
    filename: "theme.liquid",
    code: (siteId, options) => trackingSnippetPretty(siteId, options),
  },
  {
    id: "other",
    label: "Other",
    placement: "Paste into the <head> of every page you want tracked.",
    filename: "index.html",
    note: "Any platform with a place for custom head HTML will work — the tracker is a plain script tag with no dependencies.",
    code: (siteId, options) => trackingSnippetPretty(siteId, options),
  },
];

/** The tracker URL, pulled from the one-line snippet so there is one source. */
function trackerSrc(): string {
  const m = trackingSnippet("x").match(/src="([^"]+)"/);
  return m ? m[1] : "/tracker.js";
}

export function getFramework(id: string): FrameworkGuide {
  return FRAMEWORKS.find((f) => f.id === id) ?? FRAMEWORKS[FRAMEWORKS.length - 1];
}

/** The language tag for the code block, derived from the guide's filename. */
export function frameworkLanguage(id: FrameworkId): string {
  if (id === "nextjs" || id === "react") return "tsx";
  if (id === "vue") return "ts";
  if (id === "wordpress") return "php";
  return "html";
}
