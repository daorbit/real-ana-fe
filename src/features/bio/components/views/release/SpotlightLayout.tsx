import { BioCredit } from "../../BioCredit";
import { ServiceLogo } from "../../ServiceLogo";
import { BioFrame } from "../BioFrame";
import { BioLinkAnchor } from "../BioLinkAnchor";
import type { ReleaseLayoutProps } from "../layoutTypes";
import { upcomingLabel } from "@/features/bio/lib/releaseDate";
import { ArtBackdrop, ReleaseArt } from "./releaseParts";
import backdrop from "./backdrop.module.css";
import classes from "./SpotlightLayout.module.css";

export function SpotlightLayout({ page, release, variant, onLinkClick }: ReleaseLayoutProps) {
  const interactive = variant === "page";
  const upcoming = upcomingLabel(release.releaseDate);

  return (
    <BioFrame theme={page.theme} variant={variant} className={classes.root}>
      <ArtBackdrop url={release.artworkUrl} backdropClassName={backdrop.backdrop} scrimClassName={backdrop.scrim} />

      <div className={classes.column}>
        <ReleaseArt url={release.artworkUrl} title={page.title} className={classes.art} imageClassName={classes.artImage} />

        <header className={classes.head}>
          {release.subtitle && <p className={classes.eyebrow}>{release.subtitle}</p>}
          <h1 className={classes.title}>{page.title || "Release title"}</h1>
          {upcoming && <p className={classes.upcoming}>{upcoming}</p>}
        </header>

        <ul className={classes.buttons}>
          {release.rows.map((row) => (
            <li key={row.id}>
              <BioLinkAnchor
                href={row.url}
                interactive={interactive}
                className={classes.button}
                shape={page.theme.buttonStyle}
                onClick={() => onLinkClick?.(row.id)}
              >
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
