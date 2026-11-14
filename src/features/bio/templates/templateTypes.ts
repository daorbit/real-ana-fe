import type { BioPageKind, BioSocialNetwork, BioTheme } from "@/features/bio/types";

export type TemplateCategory = "music" | "podcast" | "creator" | "business" | "shop" | "events" | "apps";

export type ArtMotif = "disc" | "sun" | "wave" | "bars" | "grid" | "person" | "plate" | "house";

export type TemplateService = { service: string; action?: string };

export type BioTemplate = {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  kind: BioPageKind;
  title: string;
  bio?: string;
  subtitle?: string;
  theme: BioTheme;
  links?: string[];
  socials?: BioSocialNetwork[];
  services?: TemplateService[];
  art: { color: string; motif: ArtMotif };
};

export const TEMPLATE_CATEGORIES: { value: TemplateCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "music", label: "Music" },
  { value: "podcast", label: "Podcasts" },
  { value: "creator", label: "Creators" },
  { value: "business", label: "Business" },
  { value: "shop", label: "Shops" },
  { value: "events", label: "Events" },
  { value: "apps", label: "Apps & film" },
];
