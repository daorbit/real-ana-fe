import { BIO_SOCIAL_NETWORKS } from "@/features/bio/lib/bioOptions";
import type { BioSocial } from "@/features/bio/types";
import { SocialGlyph } from "../SocialGlyph";
import classes from "./shared.module.css";

const NETWORK_LABEL = Object.fromEntries(BIO_SOCIAL_NETWORKS.map((n) => [n.id, n.label]));

export function BioSocialRow({
  socials,
  interactive,
  align = "center",
}: {
  socials: BioSocial[];
  interactive: boolean;
  align?: "center" | "start";
}) {
  if (socials.length === 0) return null;

  return (
    <div className={classes.socials} data-align={align}>
      {socials.map((social, index) => {
        const key = social.id || `${social.network}-${index}`;
        const name = social.label?.trim() || NETWORK_LABEL[social.network];
        return interactive ? (
          <a key={key} href={social.url} target="_blank" rel="noopener noreferrer" className={classes.social} aria-label={name} title={name}>
            <SocialGlyph network={social.network} size={21} />
          </a>
        ) : (
          <span key={key} className={classes.social}>
            <SocialGlyph network={social.network} size={21} />
          </span>
        );
      })}
    </div>
  );
}
