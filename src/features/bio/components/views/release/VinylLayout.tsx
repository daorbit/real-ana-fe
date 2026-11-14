import { BioCredit } from "../../BioCredit";
import { ServiceLogo } from "../../ServiceLogo";
import { BioFrame } from "../BioFrame";
import { BioLinkAnchor } from "../BioLinkAnchor";
import type { ReleaseLayoutProps } from "../layoutTypes";
import { upcomingLabel } from "@/features/bio/lib/releaseDate";
import { ReleaseArt } from "./releaseParts";
import classes from "./VinylLayout.module.css";

export function VinylLayout({ page, release, variant, onLinkClick }: ReleaseLayoutProps) {
  const interactive = variant === "page";
  const upcoming = upcomingLabel(release.releaseDate);

  return (
    <BioFrame theme={page.theme} variant={variant} className={classes.root}>
      <div className={classes.column}>
        <div className={classes.sleeve}>
          <div className={classes.disc} aria-hidden>
            <span className={classes.label}>
              {release.artworkUrl && <img src={release.artworkUrl} alt="" className={classes.labelImage} />}
            </span>
          </div>
          <ReleaseArt url={release.artworkUrl} title={page.title} className={classes.cover} imageClassName={classes.coverImage} />
        </div>

        <header className={classes.head}>
          <h1 className={classes.title}>{page.title || "Release title"}</h1>
          {release.subtitle && <p className={classes.subtitle}>{release.subtitle}</p>}
          {upcoming && <p className={classes.upcoming}>{upcoming}</p>}
        </header>

        <ul className={classes.rows}>
          {release.rows.map((row) => (
            <li key={row.id}>
              <BioLinkAnchor href={row.url} interactive={interactive} className={classes.row} onClick={() => onLinkClick?.(row.id)}>
                <ServiceLogo service={row.service} />
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
