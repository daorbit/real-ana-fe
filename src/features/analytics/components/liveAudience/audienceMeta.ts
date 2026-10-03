import type { LiveAudience, LiveVisitor } from "@/shared/types";

export type AudienceSegment = {
  key: "confirmed" | "likely" | "ai" | "crawler" | "automation" | "suspect";
  label: string;
  singular: string;
  color: string;
  hint: string;
  value: number;
};

export function audienceSegments(a: LiveAudience): AudienceSegment[] {
  return [
    {
      key: "confirmed",
      label: "Confirmed people",
      singular: "Confirmed person",
      color: "var(--mantine-color-teal-6)",
      hint: "Moved the mouse, scrolled, typed or touched the screen with real input events.",
      value: a.confirmedHumans,
    },
    {
      key: "likely",
      label: "Likely people",
      singular: "Likely person",
      color: "var(--mantine-color-teal-3)",
      hint: "A normal browser with no bot signals that has not interacted yet, for example someone still reading.",
      value: a.likelyHumans,
    },
    {
      key: "ai",
      label: "AI agents",
      singular: "AI agent",
      color: "var(--mantine-color-violet-5)",
      hint: "AI assistants and agents browsing the page, identified by their user agent or signed requests (ChatGPT, Claude, Perplexity and others).",
      value: a.ai,
    },
    {
      key: "crawler",
      label: "Crawlers",
      singular: "Crawler",
      color: "var(--mantine-color-blue-5)",
      hint: "Search engines, SEO tools, link previews and uptime monitors that run JavaScript.",
      value: a.crawlers,
    },
    {
      key: "automation",
      label: "Automated browsers",
      singular: "Automated browser",
      color: "var(--mantine-color-orange-5)",
      hint: "Headless or scripted browsers (Puppeteer, Playwright, Selenium) detected from browser automation flags.",
      value: a.automation,
    },
    {
      key: "suspect",
      label: "Suspicious",
      singular: "Suspicious",
      color: "var(--mantine-color-gray-5)",
      hint: "Several weak signs of automation, such as no languages, a zero-size window or software graphics. Not counted as people.",
      value: a.suspect,
    },
  ];
}

export function visitorSegment(v: LiveVisitor): AudienceSegment["key"] {
  if (v.kind === "human") return v.verified ? "confirmed" : "likely";
  return v.kind;
}

export const SIGNAL_LABEL: Record<string, string> = {
  "signed-agent": "Signed AI agent request",
  "user-agent": "Identified by user agent",
  "no-ua": "No user agent",
  webdriver: "navigator.webdriver is on",
  automation: "Automation framework detected",
  headless: "Headless browser",
  nolang: "No browser languages",
  nowindow: "Zero-size window",
  noplugins: "No browser plugins",
  swgl: "Software graphics renderer",
  teleport: "Clicked without moving the mouse",
};
