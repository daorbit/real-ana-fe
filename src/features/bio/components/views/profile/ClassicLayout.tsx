import { BioCredit } from "../../BioCredit";
import { BioAvatar } from "../BioAvatar";
import { BioFrame } from "../BioFrame";
import { BioLinkAnchor } from "../BioLinkAnchor";
import { BioSocialRow } from "../BioSocialRow";
import type { ProfileLayoutProps } from "../layoutTypes";
import classes from "./ClassicLayout.module.css";

export function ClassicLayout({ page, variant, onLinkClick }: ProfileLayoutProps) {
  const interactive = variant === "page";

  return (
    <BioFrame theme={page.theme} variant={variant} className={classes.root}>
      <div className={classes.column}>
        <BioAvatar url={page.avatarUrl} size="lg" />
        <h1 className={classes.title}>{page.title || "Your name"}</h1>
        {page.bio && <p className={classes.bio}>{page.bio}</p>}
        <BioSocialRow socials={page.socials} interactive={interactive} />

        <div className={classes.links}>
          {page.links.map((link) => (
            <BioLinkAnchor
              key={link.id}
              href={link.url}
              interactive={interactive}
              className={classes.link}
              shape={page.theme.buttonStyle}
              onClick={() => onLinkClick?.(link.id)}
            >
              {link.label}
            </BioLinkAnchor>
          ))}
        </div>

        <BioCredit className={classes.credit} interactive={interactive} />
      </div>
    </BioFrame>
  );
}
