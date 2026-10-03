import { Compass, ShieldCheck, RefreshCw, Swords, GitCompareArrows, PieChart } from "lucide-react";
import type { HelpSection } from "@/shared/ui/HelpDrawer";

export const BACKLINKS_HELP: HelpSection[] = [
  {
    id: "discover",
    label: "Finding your backlinks",
    icon: Compass,
    blurb:
      "Most backlinks are found from your own traffic: when a visitor clicks a link to your site, their browser tells your tracker which page they came from.",
    items: [
      {
        term: "From your referrers",
        detail:
          "Find new links reads the referring pages recorded by your tracker over the last 90 days. Search engines, webmail, your own domain and tracking parameters are filtered out, so what is left are pages that actually link to you.",
      },
      {
        term: "Links nobody has clicked yet",
        detail:
          "A link that has never sent a visitor never shows up as a referrer. Add those by hand: paste the page that links to you and it is checked and tracked like the rest.",
      },
      {
        term: "From a backlink index",
        detail:
          "When the server has a backlink index configured, Import from index pulls the referring domains a web crawler has already found for you, including links that have never sent traffic.",
        tag: "optional",
      },
      {
        term: "Some referrers are only a domain",
        detail:
          "Many sites send just their homepage address as the referrer, not the exact page. Those are listed as Unverified until the linking page is added by hand or turns up in the index.",
      },
    ],
  },
  {
    id: "verify",
    label: "How links are verified",
    icon: ShieldCheck,
    blurb:
      "A referrer only says a visitor came from somewhere. Each source page is then fetched once and read, to confirm the link is really there and see what kind of link it is.",
    items: [
      {
        term: "Live",
        detail: "The page loads and contains a link to your domain. The anchor text, target URL and rel attribute are read from that link.",
      },
      {
        term: "Lost",
        detail:
          "The link was seen before but is gone from the page now. This is the one to act on: it usually means an edit, a redesign or a link swap.",
        tag: "important",
      },
      {
        term: "Page gone",
        detail: "The page that used to link to you now returns an error such as 404 or 410.",
      },
      {
        term: "Unverified",
        detail:
          "The page loads but no link to you was found, and none was seen before. Common for homepage-only referrers and pages that build their links with JavaScript.",
      },
      {
        term: "Unreachable",
        detail:
          "The page could not be fetched: a timeout, a firewall, or an address that is not publicly reachable. A live link is never marked lost because of a single failed fetch.",
      },
      {
        term: "Follow, nofollow, ugc, sponsored",
        detail:
          "Read from the link's rel attribute and the page's robots meta tag. Follow links pass ranking authority. Nofollow, ugc (user-generated) and sponsored (paid) links mainly send visitors.",
      },
    ],
  },
  {
    id: "monitor",
    label: "Keeping it current",
    icon: RefreshCw,
    blurb: "Links change without anyone telling you, so tracked links are checked again on a schedule.",
    items: [
      {
        term: "Weekly re-check",
        detail:
          "Any link not checked in the last seven days is fetched again by the scheduled job, oldest first. Lost links show when they disappeared.",
      },
      {
        term: "Re-check now",
        detail: "Re-checks the 20 links that have waited longest. Run it again to work through the rest.",
      },
      {
        term: "Polite by design",
        detail:
          "Each source page gets one request per check, with a few at a time and short timeouts. Private and internal addresses are never fetched.",
      },
    ],
  },
  {
    id: "competitors",
    label: "Competitor backlinks",
    icon: Swords,
    blurb:
      "Competitors are the ones you track on the Compare page. Their backlinks come from two places.",
    items: [
      {
        term: "Every page you check",
        detail:
          "When any page is fetched, whether to verify one of your links or because you pasted it into Check a page, it is also searched for links to every competitor you track. A single fetch shows who links to you and who links to them.",
      },
      {
        term: "The backlink index",
        detail:
          "With an index configured, the strongest referring domains for each competitor are imported directly, ranked by authority.",
        tag: "optional",
      },
      {
        term: "Why not just crawl the web?",
        detail:
          "Discovering every page that links to a site means crawling a large part of the internet. That is what index providers do, which is why that part is optional and paid.",
      },
    ],
  },
  {
    id: "gap",
    label: "The link gap",
    icon: GitCompareArrows,
    blurb: "The sites that already link to your competitors but not to you. These are usually your most realistic link prospects.",
    items: [
      {
        term: "Opportunities",
        detail:
          "Domains linking to at least one competitor and not to you, ranked by how many competitors they link to, then by authority. A site that links to three of your rivals has a reason to link to you too.",
      },
      {
        term: "Shared",
        detail: "Domains that link to you and to at least one competitor.",
      },
      {
        term: "Only you",
        detail: "Live referring domains that no tracked competitor has. These are links your competitors would have to work to match.",
      },
    ],
  },
  {
    id: "profiles",
    label: "Reading a link profile",
    icon: PieChart,
    blurb:
      "Each profile breaks a set of links down the same way, so you can see how a competitor gets its links and how your own profile compares.",
    items: [
      {
        term: "Anchor types",
        detail:
          "Branded anchors contain the site's name. URL anchors are the address itself. Generic ones say things like \"click here\". Keyword anchors are any other descriptive text. Image links have no text.",
      },
      {
        term: "Source types",
        detail:
          "Each linking domain is grouped as social, community (Reddit, GitHub, forums), directory (G2, Product Hunt, review sites) or editorial (everything else: blogs, news, publications).",
      },
      {
        term: "How they work",
        detail:
          "The notes on each profile come from those breakdowns. Mostly branded anchors point to earned links, a high keyword-anchor share points to active link building, and many directory domains mean listings you could likely claim too.",
      },
      {
        term: "Authority",
        detail: "Only available from the backlink index, on a 0 to 100 scale. Links found by page checks have no authority score.",
      },
    ],
  },
];
