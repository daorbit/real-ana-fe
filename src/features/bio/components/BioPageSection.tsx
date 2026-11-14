import type { BioPage } from "@/features/bio/types";
import type { useBioActions } from "@/features/bio/hooks/useBioActions";
import { BioPageCard } from "./BioPageCard";
import classes from "./BioPages.module.css";

export function BioPageSection({
  title,
  meta,
  pages,
  canEdit,
  actions,
}: {
  title: string;
  meta: string;
  pages: BioPage[];
  canEdit: boolean;
  actions: ReturnType<typeof useBioActions>;
}) {
  if (pages.length === 0) return null;

  return (
    <section className={classes.section}>
      <div className={classes.sectionHead}>
        <h3 className={classes.sectionTitle}>{title}</h3>
        <span className={classes.sectionMeta}>{meta}</span>
      </div>
      <div className={classes.grid}>
        {pages.map((page) => (
          <BioPageCard
            key={page.id}
            page={page}
            canEdit={canEdit}
            busy={actions.busyId === page.id}
            onTogglePublished={(published) => void actions.togglePublished(page, published)}
            onCopy={() => void actions.copyLink(page)}
            onQr={() => actions.openQr(page)}
            onDelete={() => actions.askDelete(page)}
          />
        ))}
      </div>
    </section>
  );
}
