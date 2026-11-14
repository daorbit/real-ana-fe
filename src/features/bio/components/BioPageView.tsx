import type { ComponentType } from "react";
import { layoutFor } from "@/features/bio/lib/bioOptions";
import type { BioLayout, PublicBioPage } from "@/features/bio/types";
import type { LayoutVariant, ProfileLayoutProps, ReleaseLayoutProps } from "./views/layoutTypes";
import { CardsLayout } from "./views/profile/CardsLayout";
import { ClassicLayout } from "./views/profile/ClassicLayout";
import { EditorialLayout } from "./views/profile/EditorialLayout";
import { GridLayout } from "./views/profile/GridLayout";
import { HeroLayout } from "./views/profile/HeroLayout";
import { ListLayout } from "./views/release/ListLayout";
import { MinimalLayout } from "./views/release/MinimalLayout";
import { PosterLayout } from "./views/release/PosterLayout";
import { SpotlightLayout } from "./views/release/SpotlightLayout";
import { TilesLayout } from "./views/release/TilesLayout";
import { VinylLayout } from "./views/release/VinylLayout";

const PROFILE: Partial<Record<BioLayout, ComponentType<ProfileLayoutProps>>> = {
  classic: ClassicLayout,
  hero: HeroLayout,
  grid: GridLayout,
  editorial: EditorialLayout,
  cards: CardsLayout,
};

const RELEASE: Partial<Record<BioLayout, ComponentType<ReleaseLayoutProps>>> = {
  list: ListLayout,
  poster: PosterLayout,
  tiles: TilesLayout,
  vinyl: VinylLayout,
  spotlight: SpotlightLayout,
  minimal: MinimalLayout,
};

export function BioPageView({
  page,
  variant = "page",
  onLinkClick,
}: {
  page: PublicBioPage;
  variant?: LayoutVariant;
  onLinkClick?: (linkId: string) => void;
}) {
  const layout = layoutFor(page.kind, page.theme.layout);

  if (page.kind === "release" && page.release) {
    const Release = RELEASE[layout] ?? ListLayout;
    return <Release page={page} release={page.release} variant={variant} onLinkClick={onLinkClick} />;
  }

  const Profile = PROFILE[layout] ?? ClassicLayout;
  return <Profile page={page} variant={variant} onLinkClick={onLinkClick} />;
}
