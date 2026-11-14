import { ArrowUpRight } from "lucide-react";
import { BioCredit } from "../../BioCredit";
import { BioAvatar } from "../BioAvatar";
import { BioFrame } from "../BioFrame";
import { BioLinkAnchor } from "../BioLinkAnchor";
import { BioSocialRow } from "../BioSocialRow";
import { LinkIcon } from "../LinkIcon";
import { hostOf, type ProfileLayoutProps } from "../layoutTypes";
import classes from "./CardsLayout.module.css";

export function CardsLayout({ page, variant, onLinkClick }: ProfileLayoutProps) {
  const interactive = variant === "page";

  return (
    <BioFrame theme={page.theme} variant={variant} className={classes.root}>
      <div className={classes.column}>
        <header className={classes.head}>
          <BioAvatar url={page.avatarUrl} />
          <h1 className={classes.title}>{page.title || "Your name"}</h1>
          {page.bio && <p className={classes.bio}>{page.bio}</p>}
          <BioSocialRow socials={page.socials} interactive={interactive} />
        </header>

        <div className={classes.cards}>
          {page.links.map((link) => {
            const host = hostOf(link.url);
            return (
              <BioLinkAnchor
                key={link.id}
                href={link.url}
                interactive={interactive}
                className={classes.card}
                onClick={() => onLinkClick?.(link.id)}
              >
                <span className={classes.iconBox}>
                  <LinkIcon label={link.label} url={link.url} size={22} />
                </span>
                <span className={classes.text}>
                  <span className={classes.label}>{link.label}</span>
                  {host && <span className={classes.host}>{host}</span>}
                </span>
                <ArrowUpRight size={18} className={classes.arrow} aria-hidden />
              </BioLinkAnchor>
            );
          })}
        </div>

        <BioCredit className={classes.credit} interactive={interactive} />
      </div>
    </BioFrame>
  );
}
