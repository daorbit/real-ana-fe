import {
  BotIcon,
  ChartLineIcon,
  ClipboardListIcon,
  MegaphoneIcon,
  ReceiptTextIcon,
  SearchIcon,
  type LucideIcon,
} from "lucide-react";
export type WhyTone = "blue" | "teal" | "violet" | "orange" | "green" | "indigo";

export interface Pillar {
  key: string;
  icon: LucideIcon;
  tone: WhyTone;
  title: string;
  body: string;
  features: string[];
}

export interface Fact {
  value: string;
  label: string;
}

export interface JourneyStep {
  key: string;
  title: string;
  body: string;
  tools: string[];
}

export interface StackRow {
  need: string;
  quantalog: string;
  elsewhere: string;
}

export interface TrustPoint {
  title: string;
  body: string;
}

export const WHY_HERO = {
  eyebrow: "Why Quantalog",
  title: "One workspace to understand, win and keep customers",
  lead:
    "Quantalog brings website analytics, lead capture, SEO, social posting, reviews, email campaigns and invoicing into one place. You see where people come from, turn them into leads and get paid, without stitching five tools together.",
};

export const WHY_FACTS: Fact[] = [
  { value: "No banner", label: "Cookieless tracking, so every visitor is counted" },
  { value: "Live", label: "Events show up as they happen, never sampled" },
  { value: "< 5 KB", label: "Tracking script, loaded without slowing your site" },
  { value: "Free start", label: "Up to 10k pageviews a month on the free plan" },
];

export const WHY_PILLARS: Pillar[] = [
  {
    key: "understand",
    icon: ChartLineIcon,
    tone: "blue",
    title: "Know what is working",
    body: "Real-time analytics that count every visit, with the reports you would otherwise build by hand.",
    features: ["Live visitors and sources", "Funnels and A/B tests", "Heatmaps and user flow", "Custom dashboards"],
  },
  {
    key: "capture",
    icon: ClipboardListIcon,
    tone: "teal",
    title: "Turn visitors into leads",
    body: "Forms, popups and bookings that drop straight into a pipeline, with the source of every lead attached.",
    features: ["Forms and popups", "Bookings with Meet links", "Payments on forms", "Form analytics"],
  },
  {
    key: "found",
    icon: SearchIcon,
    tone: "violet",
    title: "Get found",
    body: "SEO audits, Search Console and AI search checks in the same place as your traffic, so fixes connect to results.",
    features: ["Page audits and crawls", "Search Console reports", "AI search visibility", "Backlinks and competitors"],
  },
  {
    key: "reach",
    icon: MegaphoneIcon,
    tone: "orange",
    title: "Stay in front of people",
    body: "Plan posts, send campaigns and answer reviews without switching apps or copying lists around.",
    features: ["LinkedIn and Instagram posts", "Email campaigns", "Google reviews", "Link-in-bio pages"],
  },
  {
    key: "paid",
    icon: ReceiptTextIcon,
    tone: "green",
    title: "Close and get paid",
    body: "Quotes and GST-ready invoices made from the leads you captured, with tasks to keep every deal moving.",
    features: ["Quotes and invoices", "Paid form responses", "Lead pipeline", "Team tasks"],
  },
  {
    key: "orbit",
    icon: BotIcon,
    tone: "indigo",
    title: "Ask Orbit instead of digging",
    body: "Orbit AI reads your own numbers and answers in plain words, drafts forms and invoices, and works with Claude and ChatGPT.",
    features: ["Questions about your data", "Draft forms and invoices", "Weekly insights", "Claude and ChatGPT connector"],
  },
];

export const WHY_JOURNEY: JourneyStep[] = [
  {
    key: "attract",
    title: "Attract",
    body: "Find out which pages, searches and posts bring people in.",
    tools: ["Analytics", "SEO", "Social"],
  },
  {
    key: "capture",
    title: "Capture",
    body: "Ask for the details that matter, at the moment people are interested.",
    tools: ["Forms", "Popups", "Bookings"],
  },
  {
    key: "convert",
    title: "Convert",
    body: "Follow up while the lead is warm, and see who is close to buying.",
    tools: ["Pipeline", "Campaigns", "Tasks"],
  },
  {
    key: "paid",
    title: "Get paid",
    body: "Send a quote, turn it into an invoice and collect payment.",
    tools: ["Quotes", "Invoices", "Payments"],
  },
  {
    key: "learn",
    title: "Learn and repeat",
    body: "See which channel brought your best customers, and put more into it.",
    tools: ["Reports", "Insights", "Orbit AI"],
  },
];

export const WHY_STACK: StackRow[] = [
  { need: "Website analytics", quantalog: "Included", elsewhere: "A separate analytics tool" },
  { need: "Forms and lead capture", quantalog: "Included", elsewhere: "A form builder plus a spreadsheet" },
  { need: "SEO audits and Search Console", quantalog: "Included", elsewhere: "An SEO suite" },
  { need: "Social post scheduling", quantalog: "Included", elsewhere: "A scheduling app" },
  { need: "Email campaigns", quantalog: "Included", elsewhere: "An email marketing tool" },
  { need: "Quotes and invoices", quantalog: "Included", elsewhere: "An invoicing app" },
  { need: "An AI assistant on your data", quantalog: "Included", elsewhere: "Copying numbers into a chatbot" },
];

export const WHY_STACK_NOTE =
  "One login, one bill and one place where every lead keeps its source, from first visit to paid invoice.";

export const WHY_HONEST: TrustPoint[] = [
  {
    title: "When another tool may suit you better",
    body: "If you depend on Google Ads conversion imports or modelled ad attribution, Google Analytics does that better. If you need full accounting with ledgers and expenses, use accounting software alongside Quantalog's invoicing.",
  },
];

export const WHY_TRUST: TrustPoint[] = [
  {
    title: "Privacy by default",
    body: "The tracker stores nothing in your visitors' browsers, so there is no cookie to ask consent for.",
  },
  {
    title: "Your team, your rules",
    body: "Owner, admin, editor and viewer roles, with an audit log of every change in the workspace.",
  },
  {
    title: "Secure sign-in",
    body: "Two-factor authentication with backup codes, and sign-in with Google, LinkedIn or GitHub.",
  },
  {
    title: "Your data stays yours",
    body: "Export reports and responses whenever you like. Deleting a workspace removes its data from every app.",
  },
];
