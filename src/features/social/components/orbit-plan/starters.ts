import type { Draft } from "../draft";

export type Starter = { label: string; hint: string; prompt: string };

const COMMON: Starter[] = [
  {
    label: "Announce something we shipped",
    hint: "Next Tuesday morning",
    prompt: "I want to announce a new feature we just shipped. Post it next Tuesday morning.",
  },
  {
    label: "Start a weekly tip series",
    hint: "Every Monday at 9am",
    prompt: "A weekly tip about web analytics, every Monday at 9am.",
  },
  {
    label: "Share a milestone",
    hint: "Tomorrow morning",
    prompt: "Share this month's traffic milestone, tomorrow morning.",
  },
  {
    label: "Ask my audience something",
    hint: "Tomorrow at lunchtime",
    prompt: "A short question post to get replies from my audience, tomorrow at lunchtime.",
  },
];

const LINKEDIN: Starter[] = [
  {
    label: "A lesson I learned",
    hint: "Next Wednesday at 8am",
    prompt: "A first-person post about a lesson I learned running this product, next Wednesday at 8am.",
  },
  {
    label: "We're hiring",
    hint: "Monday morning",
    prompt: "A post that we're hiring, and what the role is like. Monday morning.",
  },
];

const INSTAGRAM: Starter[] = [
  {
    label: "Caption a photo I'm uploading",
    hint: "This evening",
    prompt: "A caption for a product photo I'm about to upload, going out this evening.",
  },
  {
    label: "Monthly recap",
    hint: "1st of every month at 10am",
    prompt: "A monthly recap post with a photo, on the 1st of every month at 10am.",
  },
];

export function startersFor(provider: Draft["provider"]): Starter[] {
  return [...COMMON, ...(provider === "instagram" ? INSTAGRAM : LINKEDIN)];
}
