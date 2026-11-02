import type { SeoMeta } from "@/shared/types";
import { SearchPreviewCard, SocialPreviewCard } from "./meta/MetaPreviews";
import { AllMetaTags, MetaTagList } from "./meta/MetaTagList";
import { coreTagRows, socialTagRows } from "./meta/metaRows";
import classes from "./onpage.module.css";

export function MetaPanel({ meta, url }: { meta: SeoMeta; url: string }) {
  return (
    <div className={classes.stack}>
      <div className="seo-bento">
        <SearchPreviewCard meta={meta} url={url} />
        <SocialPreviewCard meta={meta} url={url} />
      </div>
      <MetaTagList title="Core tags" rows={coreTagRows(meta, url)} />
      <MetaTagList title="Social tags" rows={socialTagRows(meta)} />
      <AllMetaTags tags={meta.allMetaTags} />
    </div>
  );
}
