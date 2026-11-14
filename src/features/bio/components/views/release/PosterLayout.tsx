import { BioCredit } from "../../BioCredit";
import { ServiceLogo } from "../../ServiceLogo";
import { BioFrame } from "../BioFrame";
import { BioLinkAnchor } from "../BioLinkAnchor";
import type { ReleaseLayoutProps } from "../layoutTypes";
import { upcomingLabel } from "@/features/bio/lib/releaseDate";
import { ReleaseArt } from "./releaseParts";
import classes from "./PosterLayout.module.css";

export function PosterLayout({ page, release, variant, onLinkClick }: ReleaseLayoutProps) {
  const interactive = variant === "page";
  const upcoming = upcomingLabel(release.releaseDate);

  return (
    <BioFrame theme={page.theme} variant={variant} className={classes.root}>
      <ReleaseArt url={release.artworkUrl} title={page.title} className={classes.art} imageClassName={classes.artImage} />

      <div className={classes.body}>
        <header className={classes.head}>
          {release.subtitle && <p className={classes.eyebrow}>{release.subtitle}</p>}
          <h1 className={classes.title}>{page.title || "Release title"}</h1>
          {upcoming && <p className={classes.upcoming}>{upcoming}</p>}
        </header>

        <ul className={classes.rows}>
          {release.rows.map((row) => (
            <li key={row.id}>
              <BioLinkAnchor href={row.url} interactive={interactive} className={classes.row} onClick={() => onLinkClick?.(row.id)}>
                <ServiceLogo service={row.service} size="sm" />
                <span className={classes.name}>{row.name}</span>
                <span className={classes.action} data-shape={page.theme.buttonStyle}>
                  {row.action}
                </span>
              </BioLinkAnchor>
            </li>
          ))}
        </ul>

        <BioCredit className={classes.credit} interactive={interactive} />
      </div>
    </BioFrame>
  );
}
