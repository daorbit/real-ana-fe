import type { SeoMetaTag } from "@/shared/types";
import { Pill } from "@/features/seo/components/shared/Pill";
import { ListTitle, SeoList } from "@/features/seo/components/shared/SeoList";
import { Thumb } from "@/features/seo/components/shared/Thumb";
import type { MetaRow } from "./metaRows";
import classes from "../onpage.module.css";

export function MetaTagList({ title, rows }: { title: string; rows: MetaRow[] }) {
  return (
    <SeoList>
      <ListTitle>{title}</ListTitle>
      {rows.map((r) => (
        <div key={r.label} className={classes.tagRow}>
          <span className={classes.tagLabel}>{r.label}</span>
          <span className={classes.tagValue} data-missing={!r.value || undefined}>
            {r.image && r.value && <Thumb src={r.value} alt={r.label} size={32} />}
            {r.value || "Not set on this page"}
          </span>
          <Pill tone={r.tone}>{r.status}</Pill>
        </div>
      ))}
    </SeoList>
  );
}

export function AllMetaTags({ tags }: { tags: SeoMetaTag[] }) {
  if (!tags.length) return null;
  return (
    <SeoList>
      <ListTitle>All meta tags · {tags.length}</ListTitle>
      <div className={classes.scroll}>
        {tags.map((t, i) => (
          <div key={`${t.name}-${i}`} className={classes.tagRow}>
            <span className={`${classes.tagLabel} ${classes.truncate}`} title={t.name}>
              <Pill mono>{t.name}</Pill>
            </span>
            <span className={classes.tagValue}>{t.content}</span>
          </div>
        ))}
      </div>
    </SeoList>
  );
}
