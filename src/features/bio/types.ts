export type BioAppearance = "light" | "dark";
export type BioButtonStyle = "rounded" | "pill" | "square";
export type BioSocialNetwork =
  | "instagram"
  | "linkedin"
  | "x"
  | "youtube"
  | "facebook"
  | "tiktok"
  | "github"
  | "website"
  | "email";

export type BioLink = { id: string; label: string; url: string; enabled: boolean };
export type BioSocial = { network: BioSocialNetwork; url: string };
export type BioTheme = { appearance: BioAppearance; accent: string; buttonStyle: BioButtonStyle };

export type BioPageInput = {
  slug: string;
  title: string;
  bio: string;
  avatarUrl: string;
  links: BioLink[];
  socials: BioSocial[];
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

export type PublicBioPage = {
  id: string;
  slug: string;
  title: string;
  bio: string;
  avatarUrl: string;
  links: Array<{ id: string; label: string; url: string }>;
  socials: BioSocial[];
  theme: BioTheme;
};
