import { BioCredit } from "../../BioCredit";
import { ServiceLogo } from "../../ServiceLogo";
import { BioFrame } from "../BioFrame";
import { BioLinkAnchor } from "../BioLinkAnchor";
import type { ReleaseLayoutProps } from "../layoutTypes";
import { upcomingLabel } from "@/features/bio/lib/releaseDate";
import { ArtBackdrop, ReleaseArt } from "./releaseParts";
import backdrop from "./backdrop.module.css";
import classes from "./TilesLayout.module.css";

export function TilesLayout({ page, release, variant, onLinkClick }: ReleaseLayoutProps) {
  const interactive = variant === "page";
  const upcoming = upcomingLabel(release.releaseDate);

  return (
    <BioFrame theme={page.theme} variant={variant} className={classes.root}>
      <ArtBackdrop url={release.artworkUrl} backdropClassName={backdrop.backdrop} scrimClassName={backdrop.scrim} />

      <div className={classes.column}>
        <ReleaseArt url={release.artworkUrl} title={page.title} className={classes.cover} imageClassName={classes.coverImage} />
        <h1 className={classes.title}>{page.title || "Release title"}</h1>
        {release.subtitle && <p className={classes.subtitle}>{release.subtitle}</p>}
        {upcoming && <p className={classes.upcoming}>{upcoming}</p>}

        <ul className={classes.grid}>
          {release.rows.map((row) => (
            <li key={row.id}>
              <BioLinkAnchor href={row.url} interactive={interactive} className={classes.tile} onClick={() => onLinkClick?.(row.id)}>
                <ServiceLogo service={row.service} size="lg" />
                <span className={classes.name}>{row.name}</span>
                <span className={classes.action}>{row.action}</span>
              </BioLinkAnchor>
            </li>
          ))}
        </ul>

        <BioCredit className={classes.credit} interactive={interactive} />
      </div>
    </BioFrame>
  );
}
