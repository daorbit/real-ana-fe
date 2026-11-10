import { CONTACT_URL, DOCS_BASE_URL, LEGAL_URLS, SITE_URL } from "@/shared/lib/docsSlugs";

export type DocBlock =
  | { kind: "p"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "steps"; items: { title: string; text: string }[] }
  | { kind: "table"; head: [string, string, string]; rows: [string, string, string][] }
  | { kind: "callout"; tone: "note" | "tip" | "warn"; title: string; text: string }
  | { kind: "links"; items: { label: string; href: string; text: string }[] };

export interface DocSection {
  id: string;
  title: string;
  blocks: DocBlock[];
}

export const WHY_TITLE = "Why Quantalog";

export const WHY_LEAD =
  "A plain guide to what Quantalog does, how it helps your business grow, how it compares with the tools you may already use, and how we look after your data.";

export const WHY_UPDATED = "Updated November 2026";

export const WHY_SECTIONS: DocSection[] = [
  {
    id: "what",
    title: "What Quantalog is",
    blocks: [
      {
        kind: "p",
        text: "Quantalog is a growth workspace. It brings website analytics, lead capture, SEO, social posting, Google reviews, email campaigns and invoicing into one place, so the whole path from a first visit to a paid invoice lives in one workspace instead of five or six separate tools.",
      },
      {
        kind: "p",
        text: "Because every part shares the same data, a lead keeps its source from the moment it arrives. When you look at a paid invoice, you can see which page, search or post brought that customer to you.",
      },
      {
        kind: "callout",
        tone: "note",
        title: "In one sentence",
        text: "Quantalog shows you where your customers come from, helps you capture and convert them, and tells you what to do more of.",
      },
    ],
  },
  {
    id: "who",
    title: "Who it is for",
    blocks: [
      { kind: "p", text: "Quantalog is built for teams that want to grow without hiring a data analyst or stitching tools together:" },
      {
        kind: "list",
        items: [
          "Small and growing businesses that sell services, products or bookings online.",
          "Agencies and freelancers who run websites, forms and reports for several clients.",
          "Founders and SaaS teams who want honest numbers without a cookie banner.",
          "Local businesses that live on enquiries, bookings and Google reviews.",
          "Creators and marketers who publish on LinkedIn and Instagram and need to know what works.",
        ],
      },
    ],
  },
  {
    id: "features",
    title: "What you can do with it",
    blocks: [
      { kind: "h3", text: "Understand your traffic" },
      {
        kind: "list",
        items: [
          "See live visitors, pages, sources, countries and devices as they happen, with no sampling.",
          "Build funnels, run A/B tests and watch heatmaps and user flow to find where people drop off.",
          "Make your own dashboards and share them with a public link or an embed.",
          "Get Quantalog Alerts when traffic drops or spikes, or tracking stops.",
        ],
      },
      { kind: "h3", text: "Capture leads" },
      {
        kind: "list",
        items: [
          "Build forms, quizzes and popups with drag and drop, or describe them to Orbit AI.",
          "Take bookings with Google Calendar and Meet links, and payments through Razorpay, Cashfree or PayU.",
          "Every response records where it came from, and moves through a pipeline: new, contacted, qualified, won or lost.",
          "Form analytics shows how every form performs and where people stop.",
        ],
      },
      { kind: "h3", text: "Get found" },
      {
        kind: "list",
        items: [
          "Audit any page for SEO, performance and accessibility, with a list of fixes.",
          "Read your Google Search Console data next to your traffic.",
          "Check how you appear in AI search answers, track backlinks and compare against competitors.",
        ],
      },
      { kind: "h3", text: "Stay in front of people" },
      {
        kind: "list",
        items: [
          "Plan and schedule LinkedIn and Instagram posts on a calendar.",
          "Send email campaigns to the leads you captured.",
          "Reply to Google reviews and publish a link-in-bio page.",
        ],
      },
      { kind: "h3", text: "Close and get paid" },
      {
        kind: "list",
        items: [
          "Send quotations and GST-ready invoices, and turn an accepted quote into an invoice in one click.",
          "Paid form responses can create a paid invoice automatically.",
          "Keep the team moving with a shared task board.",
        ],
      },
      { kind: "h3", text: "Ask Orbit AI" },
      {
        kind: "list",
        items: [
          "Ask questions about your own numbers in plain words and get a direct answer.",
          "Let Orbit draft forms and invoices, and send you weekly insights.",
          "Connect Claude or ChatGPT to your workspace through the Quantalog connector.",
        ],
      },
    ],
  },
  {
    id: "grow",
    title: "How Quantalog helps you grow",
    blocks: [
      {
        kind: "p",
        text: "Growth comes from doing more of what already works. Quantalog follows each customer through five steps and connects them, so you can see which effort paid off.",
      },
      {
        kind: "steps",
        items: [
          { title: "Attract", text: "Analytics, SEO and social posting show which pages, searches and posts bring people in." },
          { title: "Capture", text: "Forms, popups and bookings ask for the details that matter, at the moment someone is interested." },
          { title: "Convert", text: "The lead pipeline, email campaigns and tasks help you follow up while the lead is still warm." },
          { title: "Get paid", text: "Quotes and invoices turn a won lead into revenue, with payment details and a share link." },
          { title: "Learn and repeat", text: "Reports, Insights and Orbit tell you which channel brought your best customers, so you can put more into it." },
        ],
      },
      { kind: "h3", text: "An example" },
      {
        kind: "p",
        text: "Someone finds your Instagram post, visits your pricing page and books a call through your form. You send a quote, they accept it and pay the invoice. In Quantalog this is one connected story: the report shows that Instagram brought you a paying customer, and the next post goes out with more confidence.",
      },
    ],
  },
  {
    id: "setup",
    title: "Getting started in five steps",
    blocks: [
      {
        kind: "steps",
        items: [
          { title: "Add your website", text: "Create a workspace, add your site and paste one small script before </head>. Your first visit shows up live." },
          { title: "Turn on the apps you need", text: "Open Apps and switch on only what you use, such as Tasks, Invoicing, Alerts or Campaigns." },
          { title: "Publish a form", text: "Start from a template, a sentence for Orbit or a blank form, then share the link or embed it on your site." },
          { title: "Connect your channels", text: "Connect Search Console, Google reviews, LinkedIn, Instagram, Telegram or WhatsApp in a few clicks." },
          { title: "Read and act", text: "Schedule an email report, check Insights each week and ask Orbit what changed and why." },
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Start small",
        text: "You do not need every app on day one. Most teams begin with analytics and one form, then add the rest as they grow.",
      },
    ],
  },
  {
    id: "compare",
    title: "Quantalog compared with separate tools",
    blocks: [
      {
        kind: "p",
        text: "Most teams pay for, log into and copy data between several apps. Here is what Quantalog covers on its own.",
      },
      {
        kind: "table",
        head: ["What you need", "Quantalog", "Without it"],
        rows: [
          ["Website analytics", "Included, live and cookieless", "A separate analytics tool"],
          ["Forms and lead capture", "Included, with lead sources", "A form builder plus a spreadsheet"],
          ["SEO audits and Search Console", "Included", "An SEO suite"],
          ["Social post scheduling", "Included", "A scheduling app"],
          ["Email campaigns", "Included", "An email marketing tool"],
          ["Quotes and invoices", "Included, GST-ready", "An invoicing app"],
          ["AI assistant on your data", "Included", "Copying numbers into a chatbot"],
        ],
      },
      { kind: "h3", text: "When another tool may suit you better" },
      {
        kind: "list",
        items: [
          "If you depend on Google Ads conversion imports or modelled ad attribution, Google Analytics does that better.",
          "If you need full accounting with ledgers, expenses and inventory, use accounting software alongside Quantalog's invoicing.",
          "If you need a large enterprise data warehouse, a dedicated BI tool will go further.",
        ],
      },
      {
        kind: "callout",
        tone: "note",
        title: "We would rather be honest",
        text: "Quantalog is not trying to do everything. It aims to do the everyday growth work of a small or growing team really well, in one place.",
      },
    ],
  },
  {
    id: "privacy",
    title: "Privacy and your visitors",
    blocks: [
      {
        kind: "list",
        items: [
          "The tracker sets no cookies and keeps nothing in the browser, so there is no consent banner to show.",
          "Raw IP addresses are never stored. The IP is used only at the moment of the request and then discarded.",
          "A visitor is a hash that changes every week and differs on every site, so nobody is followed across weeks or websites.",
          "We never sell data, share it with advertisers or use it to build profiles. We are paid by subscriptions.",
          "Google data is used only for the features you connect, and you can disconnect at any time.",
        ],
      },
      {
        kind: "callout",
        tone: "tip",
        title: "Every visitor counted",
        text: "Because there is no banner to decline, your numbers include every visit, not only the people who click Accept.",
      },
    ],
  },
  {
    id: "security",
    title: "Security and your team",
    blocks: [
      {
        kind: "list",
        items: [
          "Owner, admin, editor and viewer roles decide who can see and change what.",
          "An audit log records every change made in the workspace.",
          "Two-factor authentication with backup codes, plus sign-in with Google, LinkedIn or GitHub.",
          "Data is encrypted in transit with TLS, and passwords are stored only as one-way hashes.",
          "Keys for connected apps and payment providers are stored encrypted.",
          "Export reports and responses whenever you like. Deleting a workspace removes its data from every app.",
        ],
      },
    ],
  },
  {
    id: "pricing",
    title: "Plans and pricing",
    blocks: [
      {
        kind: "list",
        items: [
          "Start free with up to 10k pageviews a month, and move up only when you grow.",
          "Paid plans add higher limits, longer ranges and more reports.",
          "Some Quantalog apps are a one-time unlock per workspace, never a new subscription.",
          "Orbit AI is included in every plan.",
        ],
      },
      {
        kind: "links",
        items: [{ label: "See plans", href: "/app/billing/plans", text: "Compare plans and limits for this workspace." }],
      },
    ],
  },
  {
    id: "help",
    title: "Getting help",
    blocks: [
      {
        kind: "links",
        items: [
          { label: "Documentation", href: DOCS_BASE_URL, text: "Step-by-step guides for every feature." },
          { label: "Contact support", href: CONTACT_URL, text: "Write to us and we will get back to you." },
          { label: "Detailed comparisons", href: `${SITE_URL}/compare`, text: "Quantalog side by side with other analytics tools." },
        ],
      },
    ],
  },
  {
    id: "legal",
    title: "Legal",
    blocks: [
      { kind: "p", text: "These documents explain exactly what we collect, why, and the choices you have." },
      {
        kind: "links",
        items: [
          { label: "Privacy Policy", href: LEGAL_URLS.privacy, text: "What we collect, how we use it and your rights." },
          { label: "Terms of Service", href: LEGAL_URLS.terms, text: "The agreement for using Quantalog." },
          { label: "Data Processing Addendum", href: LEGAL_URLS.dpa, text: "How we process personal data on your behalf." },
        ],
      },
    ],
  },
];
