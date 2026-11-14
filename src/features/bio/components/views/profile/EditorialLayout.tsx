import { ArrowUpRight } from "lucide-react";
import { BioCredit } from "../../BioCredit";
import { BioAvatar } from "../BioAvatar";
import { BioFrame } from "../BioFrame";
import { BioLinkAnchor } from "../BioLinkAnchor";
import { BioSocialRow } from "../BioSocialRow";
import type { ProfileLayoutProps } from "../layoutTypes";
import classes from "./EditorialLayout.module.css";

export function EditorialLayout({ page, variant, onLinkClick }: ProfileLayoutProps) {
  const interactive = variant === "page";

  return (
    <BioFrame theme={page.theme} variant={variant} className={classes.root}>
      <div className={classes.column}>
        <BioAvatar url={page.avatarUrl} size="sm" />
        <h1 className={classes.title}>{page.title || "Your name"}</h1>
        {page.bio && <p className={classes.bio}>{page.bio}</p>}

        <ol className={classes.list}>
          {page.links.map((link, index) => (
            <li key={link.id}>
              <BioLinkAnchor href={link.url} interactive={interactive} className={classes.row} onClick={() => onLinkClick?.(link.id)}>
                <span className={classes.index}>{String(index + 1).padStart(2, "0")}</span>
                <span className={classes.label}>{link.label}</span>
                <ArrowUpRight size={20} strokeWidth={1.6} className={classes.arrow} aria-hidden />
              </BioLinkAnchor>
            </li>
          ))}
        </ol>

        <div className={classes.foot}>
          <BioSocialRow socials={page.socials} interactive={interactive} align="start" />
          <BioCredit className={classes.credit} interactive={interactive} />
        </div>
      </div>
    </BioFrame>
  );
}
