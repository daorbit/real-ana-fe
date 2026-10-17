import type { ReactNode } from "react";
import { adminSectionMeta, type AdminSectionId } from "../../lib/adminSections";
import classes from "./AdminLayout.module.css";

export function AdminSection({
  id,
  actions,
  children,
}: {
  id: AdminSectionId;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { label, description, icon: Icon, tone } = adminSectionMeta(id);

  return (
    <section aria-labelledby={`admin-section-${id}`}>
      <header className={classes.sectionHead}>
        <div className={classes.sectionIdentity}>
          <span className={classes.tile} data-tone={tone} data-size="lg" aria-hidden>
            <Icon size={20} strokeWidth={2} />
          </span>
          <div className={classes.sectionText}>
            <h2 id={`admin-section-${id}`} className={classes.sectionTitle}>
              {label}
            </h2>
            <p className={classes.sectionDesc}>{description}</p>
          </div>
        </div>
        {actions && <div className={classes.sectionActions}>{actions}</div>}
      </header>
      {children}
    </section>
  );
}
