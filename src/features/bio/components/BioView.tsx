import { useRef } from "react";
import { SITE_URL } from "@/shared/lib/docsSlugs";
import { useBioAccent } from "@/features/bio/hooks/useBioAccent";
import { BIO_SOCIAL_NETWORKS } from "@/features/bio/lib/bioOptions";
import type { BioSocial, BioTheme } from "@/features/bio/types";
import { SocialGlyph } from "./SocialGlyph";
import classes from "./BioView.module.css";

type ViewLink = { id: string; label: string; url: string };

const NETWORK_LABEL = Object.fromEntries(BIO_SOCIAL_NETWORKS.map((n) => [n.id, n.label]));

function initialsOf(title: string): string {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export function BioView({
  title,
  bio,
  avatarUrl,
  links,
  socials,
  theme,
  linkHref,
  variant = "page",
}: {
  title: string;
  bio: string;
  avatarUrl: string;
  links: ViewLink[];
  socials: BioSocial[];
  theme: BioTheme;
  linkHref?: (link: ViewLink) => string;
  variant?: "page" | "preview";
}) {
  const ref = useRef<HTMLDivElement>(null);
  useBioAccent(ref, theme.accent);
  const interactive = variant === "page";

  return (
    <div ref={ref} className={classes.root} data-appearance={theme.appearance} data-variant={variant}>
      <div className={classes.column}>
        <div className={classes.avatar} aria-hidden>
          {avatarUrl ? <img src={avatarUrl} alt="" className={classes.avatarImage} /> : <span>{initialsOf(title)}</span>}
        </div>
        <h1 className={classes.title}>{title || "Your name"}</h1>
        {bio && <p className={classes.bio}>{bio}</p>}

        {socials.length > 0 && (
          <div className={classes.socials}>
            {socials.map((social) =>
              interactive ? (
                <a
                  key={social.network}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={classes.social}
                  aria-label={NETWORK_LABEL[social.network]}
                >
                  <SocialGlyph network={social.network} size={22} />
                </a>
              ) : (
                <span key={social.network} className={classes.social}>
                  <SocialGlyph network={social.network} size={20} />
                </span>
              ),
            )}
          </div>
        )}

        <div className={classes.links}>
          {links.map((link) =>
            interactive ? (
              <a
                key={link.id}
                href={linkHref ? linkHref(link) : link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={classes.link}
                data-shape={theme.buttonStyle}
              >
                {link.label}
              </a>
            ) : (
              <span key={link.id} className={classes.link} data-shape={theme.buttonStyle}>
                {link.label}
              </span>
            ),
          )}
          {links.length === 0 && !interactive && <span className={classes.placeholder}>Your links show here</span>}
        </div>

        <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className={classes.credit} tabIndex={interactive ? 0 : -1}>
          Made with Quantalog
        </a>
      </div>
    </div>
  );
}
