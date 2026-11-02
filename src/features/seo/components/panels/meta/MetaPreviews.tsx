import { Globe } from "lucide-react";
import type { SeoMeta } from "@/shared/types";
import { SeoCard } from "@/features/seo/components/shared/SeoCard";
import { FaviconDot } from "@/features/seo/components/shared/Thumb";
import classes from "../onpage.module.css";

function clip(text: string, n: number): string {
  return text.length > n ? `${text.slice(0, n).trimEnd()}…` : text;
}

function urlParts(url: string): { host: string; crumbs: string[] } {
  try {
    const u = new URL(url);
    return { host: u.hostname.replace(/^www\./, ""), crumbs: u.pathname.split("/").filter(Boolean) };
  } catch {
    return { host: url, crumbs: [] };
  }
}

export function SearchPreviewCard({ meta, url }: { meta: SeoMeta; url: string }) {
  const { host, crumbs } = urlParts(url);
  return (
    <SeoCard className="col-6" title="Search preview" description="Roughly how this page reads on a results page.">
      <div className={classes.serp}>
        <div className={classes.serpCrumb}>
          <span className={classes.serpFavicon}>
            {meta.favicon ? <FaviconDot src={meta.favicon} /> : <Globe size={13} />}
          </span>
          <span className={classes.serpHost}>
            {host}
            {crumbs.length > 0 && ` › ${crumbs.join(" › ")}`}
          </span>
        </div>
        <p className={classes.serpTitle}>{clip(meta.title || "Untitled page", 60)}</p>
        <p className={classes.serpDesc}>
          {meta.description
            ? clip(meta.description, 160)
            : "No meta description, so search engines pull a snippet from the page copy instead."}
        </p>
      </div>
    </SeoCard>
  );
}

export function SocialPreviewCard({ meta, url }: { meta: SeoMeta; url: string }) {
  const { host } = urlParts(meta.ogUrl || url);
  const image = meta.ogImage || meta.twitterImage;
  const title = meta.ogTitle || meta.twitterTitle || meta.title;
  const description = meta.ogDescription || meta.twitterDescription || meta.description;

  return (
    <SeoCard className="col-6" title="Social preview" description="What a shared link renders as on social apps.">
      <div className={classes.social}>
        {image ? (
          <img src={image} alt="" className={classes.socialImage} loading="lazy" decoding="async" />
        ) : (
          <div className={classes.socialEmpty}>No og:image set</div>
        )}
        <div className={classes.socialBody}>
          <span className={classes.socialHost}>{host}</span>
          <span className={classes.socialTitle}>{title || "Untitled page"}</span>
          {description && <span className={classes.socialDesc}>{description}</span>}
        </div>
      </div>
    </SeoCard>
  );
}
