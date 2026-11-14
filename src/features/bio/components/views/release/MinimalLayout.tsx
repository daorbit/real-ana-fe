import { ArrowUpRight } from "lucide-react";
import { BioCredit } from "../../BioCredit";
import { ServiceLogo } from "../../ServiceLogo";
import { BioFrame } from "../BioFrame";
import { BioLinkAnchor } from "../BioLinkAnchor";
import type { ReleaseLayoutProps } from "../layoutTypes";
import { upcomingLabel } from "@/features/bio/lib/releaseDate";
import { ReleaseArt } from "./releaseParts";
import classes from "./MinimalLayout.module.css";

export function MinimalLayout({ page, release, variant, onLinkClick }: ReleaseLayoutProps) {
  const interactive = variant === "page";
  const upcoming = upcomingLabel(release.releaseDate);

  return (
    <BioFrame theme={page.theme} variant={variant} className={classes.root}>
      <div className={classes.column}>
        <header className={classes.head}>
          <ReleaseArt url={release.artworkUrl} title={page.title} className={classes.art} imageClassName={classes.artImage} />
          <div className={classes.headText}>
            {release.subtitle && <p className={classes.eyebrow}>{release.subtitle}</p>}
            <h1 className={classes.title}>{page.title || "Release title"}</h1>
          </div>
        </header>
        {upcoming && <p className={classes.upcoming}>{upcoming}</p>}

        <ul className={classes.rows}>
          {release.rows.map((row) => (
            <li key={row.id}>
              <BioLinkAnchor href={row.url} interactive={interactive} className={classes.row} onClick={() => onLinkClick?.(row.id)}>
                <ServiceLogo service={row.service} size="sm" />
                <span className={classes.name}>{row.name}</span>
                <span className={classes.action}>{row.action}</span>
                <ArrowUpRight size={18} className={classes.arrow} aria-hidden />
              </BioLinkAnchor>
            </li>
          ))}
        </ul>

        <BioCredit className={classes.credit} interactive={interactive} />
      </div>
    </BioFrame>
  );
}
