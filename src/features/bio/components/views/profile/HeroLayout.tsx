import { ChevronRight } from "lucide-react";
import { BioCredit } from "../../BioCredit";
import { BioFrame } from "../BioFrame";
import { BioLinkAnchor } from "../BioLinkAnchor";
import { BioSocialRow } from "../BioSocialRow";
import { LinkIcon } from "../LinkIcon";
import type { ProfileLayoutProps } from "../layoutTypes";
import classes from "./HeroLayout.module.css";

export function HeroLayout({ page, variant, onLinkClick }: ProfileLayoutProps) {
  const interactive = variant === "page";

  return (
    <BioFrame theme={page.theme} variant={variant} className={classes.root}>
      <div className={classes.cover} aria-hidden>
        {page.avatarUrl && <img src={page.avatarUrl} alt="" className={classes.coverImage} />}
      </div>

      <div className={classes.sheet}>
        <h1 className={classes.title}>{page.title || "Your name"}</h1>
        {page.bio && <p className={classes.bio}>{page.bio}</p>}
        <BioSocialRow socials={page.socials} interactive={interactive} align="start" />

        {page.links.length > 0 && (
          <div className={classes.group}>
            {page.links.map((link) => (
              <BioLinkAnchor
                key={link.id}
                href={link.url}
                interactive={interactive}
                className={classes.row}
                onClick={() => onLinkClick?.(link.id)}
              >
                <LinkIcon label={link.label} url={link.url} />
                <span className={classes.label}>{link.label}</span>
                <ChevronRight size={17} className={classes.chevron} aria-hidden />
              </BioLinkAnchor>
            ))}
          </div>
        )}

        <BioCredit className={classes.credit} interactive={interactive} />
      </div>
    </BioFrame>
  );
}
