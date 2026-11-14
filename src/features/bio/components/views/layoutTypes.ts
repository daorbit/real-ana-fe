import type { PublicBioPage } from "@/features/bio/types";

export type LayoutVariant = "page" | "preview";

export type ProfileLayoutProps = {
  page: PublicBioPage;
  variant: LayoutVariant;
  onLinkClick?: (linkId: string) => void;
};

export type ReleaseLayoutProps = ProfileLayoutProps & {
  release: NonNullable<PublicBioPage["release"]>;
};

export function hostOf(url: string): string {
  if (!url || url === "#") return "";
  try {
    return new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
