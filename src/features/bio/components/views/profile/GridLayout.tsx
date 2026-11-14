import { ArrowUpRight } from "lucide-react";
import { BioCredit } from "../../BioCredit";
import { BioAvatar } from "../BioAvatar";
import { BioFrame } from "../BioFrame";
import { BioLinkAnchor } from "../BioLinkAnchor";
import { BioSocialRow } from "../BioSocialRow";
import { LinkIcon } from "../LinkIcon";
import type { ProfileLayoutProps } from "../layoutTypes";
import classes from "./GridLayout.module.css";

export function GridLayout({ page, variant, onLinkClick }: ProfileLayoutProps) {
  const interactive = variant === "page";

  return (
    <BioFrame theme={page.theme} variant={variant} className={classes.root}>
      <div className={classes.column}>
        <header className={classes.head}>
          <BioAvatar url={page.avatarUrl} size="sm" />
          <div className={classes.identity}>
            <h1 className={classes.title}>{page.title || "Your name"}</h1>
            {page.bio && <p className={classes.bio}>{page.bio}</p>}
          </div>
        </header>

        <div className={classes.grid}>
          {page.links.map((link, index) => (
            <BioLinkAnchor
              key={link.id}
              href={link.url}
              interactive={interactive}
              className={classes.tile}
              shape={index === 0 ? "featured" : undefined}
              onClick={() => onLinkClick?.(link.id)}
            >
              <span className={classes.tileTop}>
                <LinkIcon label={link.label} url={link.url} size={20} />
                <ArrowUpRight size={16} className={classes.arrow} aria-hidden />
              </span>
              <span className={classes.label}>{link.label}</span>
            </BioLinkAnchor>
          ))}
        </div>

        <BioSocialRow socials={page.socials} interactive={interactive} />
        <BioCredit className={classes.credit} interactive={interactive} />
      </div>
    </BioFrame>
  );
}
