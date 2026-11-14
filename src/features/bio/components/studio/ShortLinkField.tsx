import { Copy, ExternalLink, Lock, Shuffle } from "lucide-react";
import { cleanSlug, publicBioPrefix, publicBioUrl, randomSlug } from "@/features/bio/lib/bioOptions";
import { copyText } from "@/features/bio/lib/copyText";
import { ShareLinks } from "./ShareLinks";
import classes from "./Share.module.css";

export function ShortLinkField({ slug, title, onChange }: { slug: string; title: string; onChange: (slug: string) => void }) {
  const url = publicBioUrl(slug);

  return (
    <div className={classes.share}>
      <div className={classes.addressRow}>
        <label className={classes.address}>
          <Lock size={12} className={classes.lock} aria-hidden />
          <span className={classes.host}>{publicBioPrefix()}</span>
          <input
            className={classes.slug}
            aria-label="Short link"
            placeholder="your-name"
            maxLength={32}
            spellCheck={false}
            value={slug}
            onChange={(e) => onChange(cleanSlug(e.currentTarget.value))}
          />
          <button type="button" className={classes.inlineIcon} aria-label="New random link" title="New random link" onClick={() => onChange(randomSlug())}>
            <Shuffle size={14} />
          </button>
        </label>
        <a className={classes.iconLink} href={url} target="_blank" rel="noopener noreferrer" aria-label="Open page" title="Open page">
          <ExternalLink size={15} />
        </a>
        <button type="button" className={classes.copy} onClick={() => void copyText(url)}>
          <Copy size={14} />
          Copy
        </button>
      </div>
      <ShareLinks url={url} slug={slug} title={title} />
    </div>
  );
}
