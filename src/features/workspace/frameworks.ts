import { trackingSnippet, trackingSnippetPretty, type TrackerOptions } from "@/features/workspace/tracker";

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
  | "nuxt"
  | "svelte"
  | "angular"
  | "astro"
  | "remix"
  | "gatsby"
  | "wordpress"
  | "webflow"
  | "shopify"
  | "squarespace"
  | "wix"
  | "framer"
  | "ghost"
  | "gtm"
  | "other";

/**
 * Which shelf of the picker a guide sits on.
 *
 * With four platforms the list was short enough to be one grid; with twenty it
 * is a wall, and the useful distinction is already there in the guides — some
 * are code you write, some are a settings box you paste into.
 */
export type FrameworkGroup = "code" | "platform" | "tag";

export type FrameworkGuide = {
  id: FrameworkId;
  label: string;
  group: FrameworkGroup;
  /** Where the snippet goes, in the user's own terms. */
  placement: string;
  /** Filename shown on the code block. */
  filename: string;
  /** Anything worth knowing after pasting — deploy steps, gotchas. */
  note?: string;
  /** Builds the snippet for this framework. */
  code: (siteId: string, options: TrackerOptions) => string;
};

export const FRAMEWORK_GROUPS: { id: FrameworkGroup; label: string }[] = [
  { id: "code", label: "Frameworks" },
  { id: "platform", label: "Site builders & CMS" },
  { id: "tag", label: "Tag managers" },
];

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

/**
 * Object-literal form, for configs that declare a script as data rather than
 * as markup — Nuxt's `app.head.script` being the one that needs it. The
 * attribute names stay in their `data-*` spelling, so the key is quoted.
 */
function objectAttrs(siteId: string, options: TrackerOptions, indentBy: number): string {
  const pad = " ".repeat(indentBy);
  const lines = [`${pad}"data-site": "${siteId}",`];

  if (options.dnt) lines.push(`${pad}"data-dnt": "on",`);
  if (options.hash) lines.push(`${pad}"data-hash": "on",`);
  if (options.clicks === false) lines.push(`${pad}"data-clicks": "off",`);
  if (options.errors === false) lines.push(`${pad}"data-errors": "off",`);

  const ignore = (options.ignorePages ?? []).filter(Boolean);
  if (ignore.length) lines.push(`${pad}"data-ignore-pages": "${ignore.join(",")}",`);

  const params = (options.allowParams ?? []).filter(Boolean);
  if (params.length) lines.push(`${pad}"data-allow-params": "${params.join(",")}",`);

  const domain = (options.domain ?? "").trim();
  if (domain) lines.push(`${pad}"data-domain": "${domain}",`);

  return lines.join("\n");
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
    group: "code",
    placement: "Paste just before the closing </head> tag.",
    filename: "index.html",
    code: (siteId, options) => trackingSnippetPretty(siteId, options),
  },
  {
    id: "nextjs",
    label: "Next.js",
    group: "code",
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
    group: "code",
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
    group: "code",
    placement: "Add to your app entry point, before mount.",
    filename: "main.ts",
    code: (siteId, options) => `const s = document.createElement("script");
s.src = "${trackerSrc()}";
s.async = true;
s.dataset.site = "${siteId}";${datasetLines(options, 0)}
document.head.appendChild(s);`,
  },
  {
    id: "nuxt",
    label: "Nuxt",
    group: "code",
    placement: "Add to nuxt.config.ts, under app.head.script.",
    filename: "nuxt.config.ts",
    note: "Nuxt renders this into the document head on the server, so the tracker is in the HTML before hydration.",
    code: (siteId, options) => `export default defineNuxtConfig({
  app: {
    head: {
      script: [
        {
          src: "${trackerSrc()}",
          async: true,
${objectAttrs(siteId, options, 10)}
        },
      ],
    },
  },
});`,
  },
  {
    id: "svelte",
    label: "SvelteKit",
    group: "code",
    placement: "Add to src/app.html, inside %sveltekit.head%'s <head>.",
    filename: "src/app.html",
    note: "app.html is the shell every route renders into, so one paste covers the whole app.",
    code: (siteId, options) => trackingSnippetPretty(siteId, options),
  },
  {
    id: "angular",
    label: "Angular",
    group: "code",
    placement: "Paste into src/index.html, before </head>.",
    filename: "src/index.html",
    note: "Angular's router changes the URL without a reload; the tracker follows history changes on its own, so no extra wiring is needed.",
    code: (siteId, options) => trackingSnippetPretty(siteId, options),
  },
  {
    id: "astro",
    label: "Astro",
    group: "code",
    placement: "Add to your base layout's <head>.",
    filename: "src/layouts/Layout.astro",
    note: "Astro strips script tags it processes — `is:inline` keeps this one as written.",
    code: (siteId, options) => `---
---
<html>
  <head>
    <script
      is:inline
      async
      src="${trackerSrc()}"
      data-site="${siteId}"${jsxProps(options, 6)}
    ></script>
  </head>
  <body><slot /></body>
</html>`,
  },
  {
    id: "remix",
    label: "Remix",
    group: "code",
    placement: "Add to the <head> in app/root.tsx.",
    filename: "app/root.tsx",
    note: "Goes beside <Meta /> and <Links />, so it ships with the server-rendered document.",
    code: (siteId, options) => `export default function App() {
  return (
    <html>
      <head>
        <Meta />
        <Links />
        <script
          async
          src="${trackerSrc()}"
          data-site="${siteId}"${jsxProps(options, 10)}
        />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}`,
  },
  {
    id: "gatsby",
    label: "Gatsby",
    group: "code",
    placement: "Add to gatsby-ssr.js, so it renders into every page's head.",
    filename: "gatsby-ssr.js",
    note: "Create the file at your project root if it does not exist yet, then restart the build.",
    code: (siteId, options) => `import React from "react";

export const onRenderBody = ({ setHeadComponents }) => {
  setHeadComponents([
    <script
      key="quantalog"
      async
      src="${trackerSrc()}"
      data-site="${siteId}"${jsxProps(options, 6)}
    />,
  ]);
};`,
  },
  {
    id: "wordpress",
    label: "WordPress",
    group: "platform",
    placement: "Appearance → Theme File Editor → header.php, before </head>. Or paste it into any 'header scripts' box your theme or an SEO plugin provides.",
    filename: "header.php",
    note: "Editing header.php directly is overwritten by theme updates — a child theme or a header-scripts plugin survives them.",
    code: (siteId, options) => trackingSnippetPretty(siteId, options),
  },
  {
    id: "webflow",
    label: "Webflow",
    group: "platform",
    placement: "Site settings → Custom code → Head code.",
    filename: "Head code",
    note: "Custom code only runs on published sites, not in the Designer preview.",
    code: (siteId, options) => trackingSnippetPretty(siteId, options),
  },
  {
    id: "shopify",
    label: "Shopify",
    group: "platform",
    placement: "Online Store → Themes → Edit code → layout/theme.liquid, before </head>.",
    filename: "theme.liquid",
    code: (siteId, options) => trackingSnippetPretty(siteId, options),
  },
  {
    id: "squarespace",
    label: "Squarespace",
    group: "platform",
    placement: "Settings → Developer tools → Code injection → Header.",
    filename: "Code injection — Header",
    note: "Code injection needs a Business plan or above. It does not run on the built-in preview.",
    code: (siteId, options) => trackingSnippetPretty(siteId, options),
  },
  {
    id: "wix",
    label: "Wix",
    group: "platform",
    placement: "Settings → Custom code → Add code, set to load in the Head on all pages.",
    filename: "Custom code — Head",
    note: "Choose \"Load code once\" so a visitor moving between pages is not counted twice.",
    code: (siteId, options) => trackingSnippetPretty(siteId, options),
  },
  {
    id: "framer",
    label: "Framer",
    group: "platform",
    placement: "Site settings → General → Custom code → End of <head> tag.",
    filename: "Custom code — head",
    note: "Custom code runs on the published site only, not in the Framer canvas or preview.",
    code: (siteId, options) => trackingSnippetPretty(siteId, options),
  },
  {
    id: "ghost",
    label: "Ghost",
    group: "platform",
    placement: "Settings → Code injection → Site header.",
    filename: "Code injection — Site header",
    note: "Site header injection applies to every page including posts, so one paste is enough.",
    code: (siteId, options) => trackingSnippetPretty(siteId, options),
  },
  {
    id: "gtm",
    label: "Google Tag Manager",
    group: "tag",
    placement: "New tag → Custom HTML, triggered on All Pages. Then publish the container.",
    filename: "Custom HTML tag",
    note: "Tick \"Support document.write\" only if your container needs it — the tracker does not. Remember that nothing is live until you publish the container version.",
    code: (siteId, options) => trackingSnippetPretty(siteId, options),
  },
  {
    id: "other",
    label: "Other",
    group: "platform",
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
  if (id === "nextjs" || id === "react" || id === "remix" || id === "gatsby") return "tsx";
  if (id === "vue" || id === "nuxt") return "ts";
  if (id === "wordpress") return "php";
  // Astro files are HTML with a frontmatter fence; `html` highlights the part
  // that matters and leaves the fence alone.
  return "html";
}

/** The guides for one shelf of the picker, in declaration order. */
export function frameworksInGroup(group: FrameworkGroup): FrameworkGuide[] {
  return FRAMEWORKS.filter((f) => f.group === group);
}
