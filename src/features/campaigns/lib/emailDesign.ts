import {
  AlignLeft, Building2, Columns2, Heading1, Image, type LucideIcon, Minus, MoveVertical, MousePointerClick,
} from "lucide-react";
import type { EmailBlock, EmailBlockType, EmailTheme } from "@/features/campaigns/types";

export const LIGHT_THEME: EmailTheme = {
  pageColor: "#f5f5f7",
  cardColor: "#ffffff",
  headingColor: "#1d1d1f",
  textColor: "#424245",
  mutedColor: "#86868b",
  accentColor: "#0071e3",
  buttonTextColor: "#ffffff",
  font: "sans",
  width: 600,
  radius: 18,
};

export const THEME_PRESETS: { id: string; label: string; theme: EmailTheme }[] = [
  { id: "light", label: "Light", theme: LIGHT_THEME },
  {
    id: "graphite",
    label: "Graphite",
    theme: { ...LIGHT_THEME, pageColor: "#1d1d1f", cardColor: "#2c2c2e", headingColor: "#f5f5f7", textColor: "#d1d1d6", mutedColor: "#98989d", accentColor: "#f5f5f7", buttonTextColor: "#1d1d1f" },
  },
  {
    id: "black",
    label: "Black",
    theme: { ...LIGHT_THEME, pageColor: "#000000", cardColor: "#000000", headingColor: "#f5f5f7", textColor: "#a1a1a6", mutedColor: "#86868b", accentColor: "#2997ff", buttonTextColor: "#ffffff", radius: 0 },
  },
  {
    id: "paper",
    label: "Paper",
    theme: { ...LIGHT_THEME, pageColor: "#fbfbf9", cardColor: "#fbfbf9", headingColor: "#1d1d1f", textColor: "#3a3a3c", mutedColor: "#8e8e93", accentColor: "#1d1d1f", buttonTextColor: "#ffffff", font: "serif", width: 560, radius: 0 },
  },
];

export const BLOCK_INFO: Record<EmailBlockType, { label: string; icon: LucideIcon }> = {
  brand: { label: "Your logo", icon: Building2 },
  heading: { label: "Heading", icon: Heading1 },
  text: { label: "Text", icon: AlignLeft },
  image: { label: "Image", icon: Image },
  button: { label: "Button", icon: MousePointerClick },
  columns: { label: "Two columns", icon: Columns2 },
  divider: { label: "Divider", icon: Minus },
  spacer: { label: "Space", icon: MoveVertical },
};

export const ADDABLE_BLOCKS: EmailBlockType[] = ["heading", "text", "image", "button", "columns", "divider", "spacer", "brand"];

export function blockId(): string {
  return crypto.randomUUID();
}

export function newBlock(type: EmailBlockType): EmailBlock {
  const id = blockId();
  switch (type) {
    case "brand":
      return { id, type, align: "center" };
    case "heading":
      return { id, type, text: "Your headline", size: "l", align: "left" };
    case "text":
      return { id, type, text: "Write your message here.", size: "m", align: "left" };
    case "button":
      return { id, type, label: "Learn more", url: "", align: "left", fullWidth: false };
    case "image":
      return { id, type, url: "", alt: "", link: "", width: 100, radius: 12 };
    case "divider":
      return { id, type };
    case "spacer":
      return { id, type, height: 24 };
    case "columns":
      return { id, type, leftTitle: "First point", leftText: "Say something useful here.", rightTitle: "Second point", rightText: "Say something useful here." };
  }
}

export function blockSummary(block: EmailBlock): string {
  switch (block.type) {
    case "heading":
    case "text":
      return block.text.trim().replace(/\s+/g, " ") || "Empty";
    case "button":
      return block.label || "No label";
    case "image":
      return block.alt || (block.url ? "Image added" : "No image yet");
    case "columns":
      return [block.leftTitle, block.rightTitle].filter(Boolean).join(" · ") || "Empty";
    case "spacer":
      return `${block.height} px`;
    case "brand":
      return "From your Branding settings";
    case "divider":
      return "A thin line";
  }
}
