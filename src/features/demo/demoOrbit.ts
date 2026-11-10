import { demoStats } from "@/features/demo/demoStats";

const MODEL = { id: "demo-orbit", label: "Orbit (demo)" };
const DAY = 86_400_000;
const iso = (msAgo: number) => new Date(Date.now() - msAgo).toISOString();
const fmt = (n: number) => n.toLocaleString("en-US");

const SUGGESTIONS = [
  "Which pages bring the most visitors?",
  "Where does my traffic come from?",
  "How did this week compare to last week?",
];

export function demoOrbitStatus() {
  return {
    configured: true,
    plan: { slug: "pro", name: "Pro", tier: "advanced" as const, monthlyQuota: 500, maxQuestionChars: 4000, imageGeneration: false },
    models: [{ ...MODEL, hint: "Sample answers for the live demo", locked: false, tier: "basic" as const }],
    imageModels: [],
  };
}

function pagesReply(): string {
  const s = demoStats("7d");
  const rows = s.topPages.slice(0, 5).map((p, i) => `${i + 1}. **${p.key}** — ${fmt(p.count)} views`).join("\n");
  return `These pages led the last 7 days:\n\n${rows}\n\n**${s.topPages[0].key}** carries most of the traffic, so it's the best place to test a stronger call to action.`;
}

function sourcesReply(): string {
  const s = demoStats("7d");
  const rows = s.topReferrers.slice(0, 5).map((r) => `- **${r.key}** — ${fmt(r.count)} sessions`).join("\n");
  return `Here's where visitors came from over the last 7 days:\n\n${rows}\n\n**${s.topReferrers[0].key}** is your biggest source. A short UTM-tagged campaign there would show which posts convert.`;
}

function summaryReply(): string {
  const s = demoStats("7d");
  return `Over the last 7 days you had **${fmt(s.pageviews)} pageviews** from **${fmt(s.visitors)} visitors**, up **${s.deltas.pageviews}%** on the week before. Bounce rate fell to **${s.bounceRate}%** and visitors read **${s.pagesPerSession} pages** per session.\n\nGrowth is steady, so keep publishing on the pages that already rank and watch whether the new visitors come back.`;
}

function replyFor(question: string): string {
  const q = question.toLowerCase();
  if (/page|content|post/.test(q)) return pagesReply();
  if (/source|referr|come from|channel|traffic from/.test(q)) return sourcesReply();
  return summaryReply();
}

export function demoOrbitAnswer(body: unknown) {
  const question = typeof (body as { question?: unknown })?.question === "string" ? (body as { question: string }).question : "";
  return {
    reply: `${replyFor(question)}\n\n_This is a sample answer from the live demo. In your own workspace Orbit reads your real data._`,
    suggestions: SUGGESTIONS,
    model: MODEL.id,
    modelLabel: MODEL.label,
    remaining: 500,
    conversationId: null,
  };
}

export function demoOrbitShortReply() {
  return { reply: summaryReply() };
}

const CONVERSATIONS = [
  { id: "demo-convo-1", title: "Which pages bring the most visitors?", question: "Which pages bring the most visitors?", ago: 2 * DAY },
  { id: "demo-convo-2", title: "Where does my traffic come from?", question: "Where does my traffic come from?", ago: 5 * DAY },
  { id: "demo-convo-3", title: "Weekly summary", question: "Summarise my week", ago: 9 * DAY },
];

export function demoOrbitConversations() {
  return {
    conversations: CONVERSATIONS.map((c) => ({
      id: c.id,
      title: c.title,
      messageCount: 2,
      lastMessageAt: iso(c.ago),
      lastModelLabel: MODEL.label,
      createdAt: iso(c.ago),
      userId: null,
    })),
    nextCursor: null,
  };
}

export function demoOrbitConversation(id: string) {
  const c = CONVERSATIONS.find((x) => x.id === id) ?? CONVERSATIONS[0];
  return {
    id: c.id,
    title: c.title,
    messageCount: 2,
    lastMessageAt: iso(c.ago),
    createdAt: iso(c.ago),
    hasMore: false,
    nextBefore: null,
    messages: [
      { id: `${c.id}-q`, seq: 1, role: "user" as const, content: c.question, suggestions: [], failed: false, createdAt: iso(c.ago) },
      {
        id: `${c.id}-a`,
        seq: 2,
        role: "assistant" as const,
        content: replyFor(c.question),
        suggestions: SUGGESTIONS,
        failed: false,
        modelLabel: MODEL.label,
        createdAt: iso(c.ago),
      },
    ],
  };
}
