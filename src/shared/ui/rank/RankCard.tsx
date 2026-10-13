import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { RankTone } from "./tones";
import classes from "./Rank.module.css";

export function RankCard({
  title,
  icon: Icon,
  tone = "teal",
  subtitle,
  actions,
  fill = true,
  children,
}: {
  title: ReactNode;
  icon?: LucideIcon;
  tone?: RankTone;
  subtitle?: ReactNode;
  actions?: ReactNode;
  fill?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={classes.card} data-tone={tone} data-fill={fill || undefined}>
      <header className={classes.head}>
        {Icon && (
          <span className={classes.icon}>
            <Icon size={15} strokeWidth={2.2} />
          </span>
        )}
        <div className={classes.headText}>
          <h3 className={classes.title}>{title}</h3>
          {subtitle && <span className={classes.subtitle}>{subtitle}</span>}
        </div>
        {actions && <div className={classes.actions}>{actions}</div>}
      </header>
      {children}
    </section>
  );
}

export function RankEmpty({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <div className={classes.empty}>
      <span className={classes.emptyIcon}>
        <Icon size={16} />
      </span>
      <span className={classes.emptyText}>{children}</span>
    </div>
  );
}
