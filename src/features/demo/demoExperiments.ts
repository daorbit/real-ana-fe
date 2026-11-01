import { demoSites } from "@/features/demo/demoData";
import type { Experiment, ExperimentDetail, ExperimentResults, ExperimentsResponse } from "@/features/experiments/types";

const DAY = 24 * 60 * 60 * 1000;

function siteId(): string {
  return demoSites[0]?.siteId ?? "demo-site";
}

function experiments(): Experiment[] {
  const now = Date.now();
  return [
    {
      id: "demo-exp-1",
      name: "Pricing headline",
      siteId: siteId(),
      key: "pricing-headline",
      type: "changes",
      pages: { mode: "include", patterns: ["/pricing"] },
      devices: "all",
      goal: { type: "page", value: "/signup" },
      variants: [
        { key: "control", name: "Original", weight: 50, redirectUrl: "", changes: [] },
        {
          key: "b",
          name: "Outcome headline",
          weight: 50,
          redirectUrl: "",
          changes: [{ selector: "h1", action: "text", attr: "", value: "Know what grows your business, in real time" }],
        },
      ],
      status: "running",
      winner: "",
      keepWinner: false,
      startedAt: new Date(now - 9 * DAY).toISOString(),
      endedAt: null,
      createdAt: new Date(now - 10 * DAY).toISOString(),
    },
    {
      id: "demo-exp-2",
      name: "Short signup page",
      siteId: siteId(),
      key: "short-signup",
      type: "split",
      pages: { mode: "include", patterns: ["/signup"] },
      devices: "mobile",
      goal: { type: "event", value: "signup_completed" },
      variants: [
        { key: "control", name: "Original", weight: 50, redirectUrl: "", changes: [] },
        { key: "b", name: "One-step signup", weight: 50, redirectUrl: "/signup-quick", changes: [] },
      ],
      status: "draft",
      winner: "",
      keepWinner: false,
      startedAt: null,
      endedAt: null,
      createdAt: new Date(now - 2 * DAY).toISOString(),
    },
  ];
}

const RESULTS: Record<string, ExperimentResults> = {
  "demo-exp-1": {
    variants: [
      { key: "control", name: "Original", sessions: 1482, conversions: 71, rate: 71 / 1482, uplift: null, confidence: null },
      { key: "b", name: "Outcome headline", sessions: 1455, conversions: 98, rate: 98 / 1455, uplift: 98 / 1455 / (71 / 1482) - 1, confidence: 0.982 },
    ],
    totalSessions: 2937,
    leader: "b",
    winner: "b",
    enoughData: true,
    since: null,
    until: null,
  },
};

export function demoExperiments(): ExperimentsResponse {
  const list = experiments();
  return { experiments: list, limit: 3, running: list.filter((e) => e.status === "running").length, plan: "Starter" };
}

export function demoExperimentDetail(id: string): ExperimentDetail | null {
  const experiment = experiments().find((e) => e.id === id);
  if (!experiment) return null;
  const results = RESULTS[id] ?? {
    variants: experiment.variants.map((v) => ({ key: v.key, name: v.name, sessions: 0, conversions: 0, rate: 0, uplift: null, confidence: null })),
    totalSessions: 0,
    leader: null,
    winner: null,
    enoughData: false,
    since: null,
    until: null,
  };
  return { experiment, results };
}
