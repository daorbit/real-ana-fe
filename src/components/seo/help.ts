import {
  ListChecks, Tags, FileText, Wrench, Link2, Braces, Layers, Search, Swords,
  Lightbulb, History,
} from "lucide-react";
import type { HelpSection } from "../HelpDrawer";

/**
 * In-app help for the SEO report, one section per tab.
 *
 * The `id`s match the tab values in the SEO page, so opening the drawer from a
 * tab's help icon can select that tab's section by passing the same id.
 */
export const SEO_HELP: HelpSection[] = [
  {
    id: "overview",
    label: "Overview",
    icon: ListChecks,
    blurb:
      "The at-a-glance verdict on this page: one headline score, how it breaks down, and what to fix first. Start here, then open a tab for the detail.",
    items: [
      { term: "Overall score", detail: "A 0-100 roll-up of every check in the audit. 90+ is good, 50-89 needs work, under 50 is poor — the same bands Google's PageSpeed uses." },
      { term: "Lighthouse categories", detail: "SEO, Performance, Accessibility and Best practices, each scored on its own. A low category tells you which tab to open next." },
      { term: "Issues by severity", detail: "Critical issues actively hurt ranking or block crawling — fix those first. Warnings are worth doing; suggestions are polish." },
      { term: "Where issues cluster", detail: "Which part of the page the problems concentrate in, so you know whether it's a meta, content, technical or links job." },
      { term: "Score trend", detail: "How the overall score moved across your recent audits of this URL. A fix that worked shows up as a step up here." },
    ],
  },
  {
    id: "meta",
    label: "Meta tags",
    icon: Tags,
    blurb:
      "The tags in the page's <head> that search engines and social platforms read — title, description, canonical, and the Open Graph / Twitter tags that control how a shared link looks.",
    items: [
      { term: "Search preview", detail: "Roughly how the page renders on a results page. Seeing the title and description truncate is more useful than a raw character count." },
      { term: "Title", detail: "Aim for 30-60 characters. Too long and it's cut off in results; too short and you're wasting the strongest on-page ranking signal.", tag: "30-60" },
      { term: "Meta description", detail: "120-160 characters. It doesn't rank the page but it's the sales pitch under the title — a good one lifts click-through.", tag: "120-160" },
      { term: "Canonical URL", detail: "Tells search engines which URL is the 'real' one when the same content is reachable at several addresses, so ranking signals don't get split." },
      { term: "Social previews", detail: "Open Graph and Twitter Card tags decide the image, title and text shown when the page is shared. Missing ones mean an ugly or blank card." },
    ],
  },
  {
    id: "content",
    label: "Content",
    icon: FileText,
    blurb:
      "How the page's actual copy stacks up: length, heading structure, images, links and readability — the raw material search engines and readers judge.",
    items: [
      { term: "Word count", detail: "300+ is a reasonable floor for a page meant to rank. Thin pages struggle to demonstrate relevance for anything competitive." },
      { term: "H1 headings", detail: "Exactly one H1 per page — it's the page's main title for crawlers. Zero or several muddies what the page is about.", tag: "want 1" },
      { term: "Readability", detail: "Flesch Reading Ease, 0-100. Higher is easier to read. Very low scores mean dense sentences most visitors will bounce off." },
      { term: "Content quality", detail: "A composite of length, headings, alt text, links and structured data — a single number for how complete the page's on-page basics are." },
      { term: "Top keywords", detail: "The words that make up the most of the body text. Useful for a sanity check that the page is actually about what you think it is." },
    ],
  },
  {
    id: "technical",
    label: "Technical",
    icon: Wrench,
    blurb:
      "The under-the-hood signals a crawler looks for on every page, plus the server response and the lab Core Web Vitals from Lighthouse.",
    items: [
      { term: "Page checks", detail: "Pass/fail signals: HTTPS, a mobile viewport tag, Open Graph, structured data and image alt text. Fails here are usually quick wins." },
      { term: "Response", detail: "The HTTP status, response time and page size the server returned. A slow or oversized response drags performance down everywhere." },
      { term: "Crawler files", detail: "robots.txt and the sitemap — how search engines discover the rest of the site. A blocked or missing one can hide whole sections." },
      { term: "Core Web Vitals", detail: "Lighthouse's lab measurements — LCP, CLS and the rest — measured on the mobile profile Google indexes with. Green is good, red hurts ranking." },
    ],
  },
  {
    id: "links",
    label: "Links",
    icon: Link2,
    blurb:
      "Every link on the page, checked for a live response. Broken links waste crawl budget and send visitors to dead ends.",
    items: [
      { term: "Broken", detail: "The target returned a 404 or didn't exist. Internal broken links are entirely in your control and should be fixed first.", tag: "critical" },
      { term: "Redirects", detail: "The link resolves, but only after a hop. Each redirect costs a little crawl budget and load time — worth pointing links straight at the destination." },
      { term: "Errors / timeouts", detail: "The target server failed or was too slow to answer. Often temporary, so re-check before assuming it's dead." },
      { term: "Internal vs external", detail: "Internal links point within your own site; external ones leave it. The scope column tells you which, so you know what you can fix directly." },
    ],
  },
  {
    id: "schema",
    label: "Schema",
    icon: Braces,
    blurb:
      "The structured data (JSON-LD) on the page — the machine-readable markup that powers rich results like ratings, FAQs and breadcrumbs.",
    items: [
      { term: "Blocks & types", detail: "Each JSON-LD block and the schema.org types it declares (Organization, Product, FAQPage…). More correct types mean more eligible rich results." },
      { term: "Errors", detail: "Markup that breaks the spec — a required property missing, or a wrong value type. These stop the rich result from showing at all.", tag: "fix" },
      { term: "Recommended", detail: "Optional properties that aren't required but make the rich result stronger, like an aggregateRating on a product or a search action on the site." },
    ],
  },
  {
    id: "crawl",
    label: "Crawl",
    icon: Layers,
    blurb:
      "A multi-page crawl of the site starting from this page, so you can see site-wide issues that a single-page audit can't — orphan pages, broken internal links, depth.",
    items: [
      { term: "Pages found", detail: "How many pages the crawler reached by following internal links from the start URL. A low number can mean poor internal linking." },
      { term: "Depth", detail: "How many clicks from the start page each page sits. Pages buried deep get crawled and ranked less often." },
      { term: "Issues", detail: "Problems found across the crawl — broken links, missing titles, noindex tags — aggregated so you can fix a pattern once." },
    ],
  },
  {
    id: "search",
    label: "Search",
    icon: Search,
    blurb:
      "Real search traffic for this site pulled from Search Console — the queries and pages actually bringing visitors in from Google.",
    items: [
      { term: "Clicks & impressions", detail: "Impressions are how often you appeared in results; clicks are how often someone chose you. The ratio is your click-through rate." },
      { term: "Top queries", detail: "The search terms sending you the most traffic. Terms with high impressions but few clicks are opportunities to improve the title or description." },
      { term: "Position", detail: "Your average ranking for a query. Anything past the first page (position 10+) gets very little traffic no matter the impressions." },
    ],
  },
  {
    id: "compare",
    label: "Compare",
    icon: Swords,
    blurb:
      "This page side by side with competitor URLs you add, so you can see where they're ahead on the on-page basics and close the gap.",
    items: [
      { term: "Add a competitor", detail: "Paste a competing URL and we snapshot its meta, content and technical signals so the comparison is like-for-like." },
      { term: "Side-by-side", detail: "Word count, title length, structured data and the rest, lined up in columns. A cell where they're green and you're not is a to-do." },
      { term: "Refresh", detail: "Competitor snapshots go stale as they change their pages. Refresh to re-fetch before you rely on the comparison." },
    ],
  },
  {
    id: "suggestions",
    label: "Suggestions",
    icon: Lightbulb,
    blurb:
      "The specific performance opportunities Lighthouse found, worst first, each with what to change and roughly what it saves.",
    items: [
      { term: "Sorted worst first", detail: "The audits with the biggest score impact are at the top, so the first few entries are where your time pays back the most." },
      { term: "Advice", detail: "Plain-language guidance on the fix — defer this script, preload that font — plus the affected resources so you know where to look." },
      { term: "Estimated saving", detail: "Roughly how much load time or how many bytes the fix recovers. Use it to weigh effort against payback." },
    ],
  },
  {
    id: "history",
    label: "History",
    icon: History,
    blurb:
      "Every audit you've run for this site, newest first, so you can answer 'did that change actually help?'",
    items: [
      { term: "Score change", detail: "The delta against the run before it. A green step up after a deploy is the proof a fix landed." },
      { term: "Open a past audit", detail: "Click any row to load that older report back into the tabs — handy for seeing exactly what a page looked like before a change." },
      { term: "Best score", detail: "The highest score recorded gets a marker, so you can tell at a glance whether you're improving or slipping back." },
    ],
  },
];
