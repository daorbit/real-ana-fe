import { Mail, Bug, MessageSquare } from "lucide-react";

/**
 * The three things someone can write to us about.
 *
 * These used to live in `SupportWidget`, alongside a floating "?" button and a
 * modal that wrapped the same form the Help & support page now shows in full.
 * With one floating control on screen — Orbit — the widget had nothing left to
 * do, but the kinds themselves are still the vocabulary the page and the server
 * share, so they moved here rather than being deleted with it.
 *
 * The ids match the `kind` the support route accepts; changing one means
 * changing both.
 */

export type Kind = "support" | "bug" | "feedback";

export const SUPPORT_KINDS: Record<
  Kind,
  { title: string; blurb: string; placeholder: string; icon: typeof Bug }
> = {
  support: {
    title: "Email support",
    blurb: "Tell us what you are stuck on and we will come back to you.",
    placeholder:
      "What are you trying to do, and what happened instead? Include the site or workspace if it is about one in particular.",
    icon: Mail,
  },
  bug: {
    title: "Report a bug",
    blurb: "Something behaving wrongly? The more specific, the faster we can fix it.",
    placeholder:
      "What did you do, what did you expect, and what happened instead? Steps to reproduce help enormously.",
    icon: Bug,
  },
  feedback: {
    title: "Send feedback",
    blurb: "Missing something, or found a rough edge? We read every one of these.",
    placeholder:
      "What would make Quantalog work better for you? Blunt is fine — it is more useful than polite.",
    icon: MessageSquare,
  },
};
