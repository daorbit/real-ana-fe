import type { HeatCell } from "@/shared/types";

export type BioAppearance = "light" | "dark";
export type BioButtonStyle = "rounded" | "pill" | "square";
export type BioBackground = "plain" | "soft" | "accent" | "deep";
export type BioProfileLayout = "classic" | "hero" | "grid" | "editorial" | "cards";
export type BioReleaseLayout = "list" | "poster" | "tiles";
export type BioLayout = BioProfileLayout | BioReleaseLayout;
export type BioFont = "sans" | "serif" | "rounded" | "mono";
export type BioPageKind = "profile" | "release";
export type BioSocialNetwork =
  | "instagram"
  | "linkedin"
  | "x"
  | "youtube"
  | "facebook"
  | "tiktok"
  | "whatsapp"
  | "telegram"
  | "threads"
  | "github"
  | "website"
  | "email";

export type BioLink = { id: string; label: string; url: string; enabled: boolean };
export type BioSocial = { id: string; network: BioSocialNetwork; url: string; label?: string };
export type BioTheme = {
  appearance: BioAppearance;
  accent: string;
  buttonStyle: BioButtonStyle;
  background: BioBackground;
  layout: BioLayout;
  font: BioFont;
};

export type BioServiceRow = {
  id: string;
  service: string;
  name: string;
  url: string;
  action: string;
  enabled: boolean;
};

export type BioRelease = {
  artworkUrl: string;
  subtitle: string;
  releaseDate: string;
  rows: BioServiceRow[];
};

export type BioPageInput = {
  kind: BioPageKind;
  slug: string;
  title: string;
  bio: string;
  avatarUrl: string;
  links: BioLink[];
  socials: BioSocial[];
  release: BioRelease | null;
  theme: BioTheme;
  published: boolean;
};

export type BioPageStats = { views: number; clicks: number; linkClicks: Record<string, number> };

export type BioPage = BioPageInput & {
  id: string;
  stats: BioPageStats;
  updatedAt: string;
};

export type BioPagesResponse = { pages: BioPage[]; statsDays: number };

export type PublicServiceRow = Omit<BioServiceRow, "enabled">;

export type PublicBioPage = {
  id: string;
  kind: BioPageKind;
  slug: string;
  title: string;
  bio: string;
  avatarUrl: string;
  links: Array<{ id: string; label: string; url: string }>;
  socials: BioSocial[];
  release: (Omit<BioRelease, "rows"> & { rows: PublicServiceRow[] }) | null;
  theme: BioTheme;
};

export type BioStatRow = { key: string; count: number };
export type BioDailyPoint = { date: string; views: number; visitors: number; clicks: number };
export type BioLinkClicks = { id: string; label: string; clicks: number };

export type BioPageStatsDetail = {
  days: number;
  maxDays: number;
  views: number;
  visitors: number;
  clicks: number;
  previous: { views: number; visitors: number; clicks: number } | null;
  daily: BioDailyPoint[];
  links: BioLinkClicks[];
  sources: BioStatRow[];
  referrers: BioStatRow[];
  campaigns: BioStatRow[];
  countries: BioStatRow[];
  cities: BioStatRow[];
  devices: BioStatRow[];
  browsers: BioStatRow[];
  os: BioStatRow[];
  languages: BioStatRow[];
  heatmap: HeatCell[];
};

export type BioResolvedLink = {
  service: string;
  url: string;
  title: string;
  artist: string;
  artworkUrl: string;
};

export type BioHit = { t: "view"; s: string } | { t: "click"; s: string; l: string };
