import { Swords, Target, LineChart, Table2 } from "lucide-react";
import type { HelpSection } from "@/shared/ui/HelpDrawer";

/**
 * In-app help for the Compare page.
 *
 * Written here as plain strings rather than through i18n, unlike the SEO help:
 * that one is keyed per tab because the drawer opens onto whichever tab you
 * were reading, and this page has no tabs. Adding the keys to eleven locale
 * dictionaries for four sections nobody has asked to translate would be work
 * spent ahead of the need.
 *
 * The scoring caveat lives here rather than on the page itself. It matters —
 * a competitor's 95 is not the same measurement as the Overview tab's 95 — but
 * it is something you read once and then know, and a permanent banner
 * explaining a methodology is a banner people stop seeing.
 */
export const COMPARE_HELP: HelpSection[] = [
  {
    id: "scoring",
    label: "How scoring works",
    icon: Swords,
    blurb:
      "Competitors are graded on what one fetch of a public page can show, and your own page is re-graded the same way so the two numbers mean the same thing.",
    items: [
      {
        term: "On-page signals only",
        detail:
          "Title and description length, heading structure, content depth, internal links, structured data, response time and page weight. All of it comes from a single request to a publicly reachable URL.",
      },
      {
        term: "Not the Overview score",
        detail:
          "Lighthouse is deliberately never run against a competitor — it costs PageSpeed quota that belongs to your own sites, and nobody needs a rival's accessibility score. So these numbers are not comparable to the Lighthouse-blended score on the SEO Overview tab.",
        tag: "important",
      },
      {
        term: "Your page, re-scored",
        detail:
          "Your own audit is narrowed to exactly the fields a competitor fetch produces and scored with the same formula. Comparing a full audit against a one-fetch snapshot would flatter whichever side had more inputs.",
      },
      {
        term: "What is never measured",
        detail:
          "Backlinks, domain authority, keyword rankings and their traffic. None of it is visible from fetching a page, so none of it is guessed at here.",
      },
    ],
  },
  {
    id: "gaps",
    label: "Reading a gap card",
    icon: Target,
    blurb:
      "One card per competitor, leading with the verdict rather than the raw numbers: are they ahead, by how much, and what would close it.",
    items: [
      {
        term: "What would close the gap",
        detail:
          "Ranked by how much each change moves the score, not by how easy it is. A list that opens with a minor tag fix while your page is a thousand words short of theirs is technically correct and practically useless.",
      },
      {
        term: "Sections they cover that you do not",
        detail:
          "Headings on their page with no counterpart on yours, matched on normalised text so wording differences do not count as gaps. Each is a question a visitor asked that your page does not answer.",
      },
      {
        term: "Schema they declare and you do not",
        detail:
          "Structured data types found on their page and missing from yours. This is what earns rich results, and increasingly what makes a page quotable by AI answer engines.",
      },
      {
        term: "Prominent terms absent from your page",
        detail:
          "Words used often on their page and not at all on yours, with their own brand name filtered out. Useful as a prompt for what to write about — not a checklist to stuff into the copy.",
      },
      {
        term: "Furthest ahead",
        detail:
          "Flags whichever competitor leads you by the most. It is the one worth reading first.",
      },
    ],
  },
  {
    id: "trend",
    label: "Score over time",
    icon: LineChart,
    blurb:
      "Every refresh is recorded, so a competitor's score can be followed as it changes rather than only read as it stands today.",
    items: [
      {
        term: "Where everyone stands today",
        detail:
          "Shown until there are two days of history. On the day you add competitors this is the more useful view anyway — the question then is who is ahead, not which way it is going.",
      },
      {
        term: "The trend line",
        detail:
          "Appears once a competitor has been checked on two different days. Several refreshes on one day count as one point; plotting each would draw a vertical scribble.",
      },
      {
        term: "Failed fetches",
        detail:
          "A refresh that could not reach the page is recorded so you can see it failed, but it is left out of the line. Their server being down is not a real score drop.",
      },
      {
        term: "Six lines at most",
        detail:
          "Past six competitors the rest are listed but not plotted, so no two lines ever share a colour. Two identical lines is a chart that lies.",
      },
    ],
  },
  {
    id: "matrix",
    label: "The comparison table",
    icon: Table2,
    blurb:
      "Every check, across every competitor, for when you want to see the numbers the recommendations came from.",
    items: [
      {
        term: "Reading the marks",
        detail:
          "Each arrow sits beside a competitor's value and describes them: a red arrow up means they beat you on that row, a teal arrow down means you beat them. A dash means the two are close enough that calling a winner would be noise.",
      },
      {
        term: "Your column",
        detail:
          "Your value appears once, as the constant every competitor is measured against, rather than as one more column to scan across.",
      },
      {
        term: "Tolerances",
        detail:
          "Most rows allow a margin before declaring a winner — word count within 15%, response time within 200ms. Without it, every trivial difference would read as a finding.",
      },
    ],
  },
];
