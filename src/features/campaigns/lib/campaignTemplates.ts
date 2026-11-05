import type { CampaignInput, EmailBlock, EmailBlockDraft, EmailTheme } from "@/features/campaigns/types";
import { LIGHT_THEME, THEME_PRESETS, blockId } from "./emailDesign";

export type TemplateTone = "light" | "graphite" | "black" | "paper";

export interface CampaignTemplate {
  id: string;
  name: string;
  tone: TemplateTone;
  subject: string;
  preheader: string;
  theme: EmailTheme;
  blocks: EmailBlockDraft[];
  html?: string;
}

function themeFor(tone: TemplateTone): EmailTheme {
  return THEME_PRESETS.find((preset) => preset.id === tone)?.theme ?? LIGHT_THEME;
}

const CUSTOM_HTML_STARTER = `<!doctype html>
<html>
<body style="margin:0;padding:40px 16px;background:#f5f5f7;font-family:-apple-system,Helvetica,Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:40px;background:#ffffff;border-radius:18px">
    <h1 style="margin:0 0 12px;font-size:32px;color:#1d1d1f">Hi {{name}}</h1>
    <p style="margin:0;font-size:16px;line-height:1.5;color:#424245">Paste your own HTML here.</p>
    <p style="margin:32px 0 0;font-size:12px;color:#86868b"><a href="{{unsubscribe_url}}">Unsubscribe</a></p>
  </div>
</body>
</html>`;

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    id: "launch",
    name: "Product launch",
    tone: "black",
    subject: "Meet the new [product name]",
    preheader: "Faster, simpler and ready today.",
    theme: themeFor("black"),
    blocks: [
      { type: "brand", align: "center" },
      { type: "heading", text: "Meet the new [product name].", size: "xl", align: "center" },
      { type: "text", text: "Everything you loved, made faster and simpler.", size: "l", align: "center" },
      { type: "image", url: "", alt: "", link: "", width: 100, radius: 16 },
      { type: "spacer", height: 12 },
      { type: "button", label: "See what's new", url: "", align: "center", fullWidth: false },
    ],
  },
  {
    id: "newsletter",
    name: "Newsletter",
    tone: "light",
    subject: "What's new this month",
    preheader: "The updates worth your time.",
    theme: themeFor("light"),
    blocks: [
      { type: "brand", align: "left" },
      { type: "heading", text: "What's new this month.", size: "l", align: "left" },
      { type: "text", text: "Hi {{name}},\n\nHere are the updates worth your time.", size: "m", align: "left" },
      { type: "image", url: "", alt: "", link: "", width: 100, radius: 12 },
      { type: "divider" },
      { type: "columns", leftTitle: "New this month", leftText: "Tell people what you shipped.", rightTitle: "Worth reading", rightText: "Share a useful guide or story." },
      { type: "button", label: "Read more", url: "", align: "left", fullWidth: false },
    ],
  },
  {
    id: "offer",
    name: "Special offer",
    tone: "light",
    subject: "20% off, this week only",
    preheader: "A thank you for your interest.",
    theme: { ...themeFor("light"), accentColor: "#1d1d1f" },
    blocks: [
      { type: "brand", align: "center" },
      { type: "heading", text: "20% off.", size: "xl", align: "center" },
      { type: "text", text: "A thank you for your interest. This offer is open for this week only.", size: "l", align: "center" },
      { type: "button", label: "Claim the offer", url: "", align: "center", fullWidth: true },
      { type: "text", text: "Use code [YOUR CODE] at checkout.", size: "s", align: "center" },
    ],
  },
  {
    id: "event",
    name: "Event invite",
    tone: "graphite",
    subject: "You're invited",
    preheader: "Save your seat.",
    theme: themeFor("graphite"),
    blocks: [
      { type: "brand", align: "left" },
      { type: "heading", text: "You're invited.", size: "xl", align: "left" },
      { type: "text", text: "Join us for a live session on [topic].", size: "l", align: "left" },
      { type: "divider" },
      { type: "columns", leftTitle: "When", leftText: "[Date and time]", rightTitle: "Where", rightText: "[Online or address]" },
      { type: "button", label: "Save my seat", url: "", align: "left", fullWidth: false },
    ],
  },
  {
    id: "welcome",
    name: "Welcome",
    tone: "light",
    subject: "Welcome, {{name}}",
    preheader: "Here's how to get started.",
    theme: themeFor("light"),
    blocks: [
      { type: "brand", align: "center" },
      { type: "heading", text: "Welcome, {{name}}.", size: "l", align: "center" },
      { type: "text", text: "We're glad you're here. Here's the best place to start.", size: "m", align: "center" },
      { type: "image", url: "", alt: "", link: "", width: 100, radius: 12 },
      { type: "button", label: "Get started", url: "", align: "center", fullWidth: false },
    ],
  },
  {
    id: "note",
    name: "Personal note",
    tone: "paper",
    subject: "A quick note",
    preheader: "Thanks for getting in touch.",
    theme: themeFor("paper"),
    blocks: [
      { type: "text", text: "Hi {{name}},\n\nThanks for filling in our form. We read every response, and we'd love to help with what you asked about.\n\nJust reply to this email and we'll take it from there.\n\n[Your name]", size: "m", align: "left" },
    ],
  },
];

export const BLANK_TEMPLATE: CampaignTemplate = {
  id: "blank",
  name: "Blank",
  tone: "light",
  subject: "",
  preheader: "",
  theme: LIGHT_THEME,
  blocks: [
    { type: "brand", align: "left" },
    { type: "text", text: "Hi {{name}},\n\n", size: "m", align: "left" },
  ],
};

export const HTML_TEMPLATE: CampaignTemplate = {
  id: "html",
  name: "Custom HTML",
  tone: "light",
  subject: "",
  preheader: "",
  theme: LIGHT_THEME,
  blocks: [],
  html: CUSTOM_HTML_STARTER,
};

export function draftFromTemplate(template: CampaignTemplate, senderAddress: string): CampaignInput {
  return {
    name: template.id === "blank" || template.id === "html" ? "Untitled campaign" : template.name,
    subject: template.subject,
    preheader: template.preheader,
    mode: template.html ? "html" : "design",
    design: {
      theme: template.theme,
      blocks: template.blocks.map((block) => ({ ...block, id: blockId() }) as EmailBlock),
    },
    html: template.html ?? "",
    senderAddress,
    formIds: [],
    imported: [],
  };
}
