import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import classes from "./SecurityGroup.module.css";

export type GlyphHue = "slate" | "blue" | "indigo" | "violet" | "orange" | "rose" | "green";

export function SecurityGroup({
  label,
  footer,
  children,
}: {
  label?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={classes.group}>
      {label && <h3 className={classes.label}>{label}</h3>}
      <div className={classes.card}>{children}</div>
      {footer && <p className={classes.footer}>{footer}</p>}
    </section>
  );
}

export function SecurityRow({
  id,
  icon: Icon,
  hue,
  title,
  status,
  description,
  action,
  danger = false,
  children,
}: {
  id?: string;
  icon: LucideIcon;
  hue: GlyphHue;
  title: ReactNode;
  status?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  danger?: boolean;
  children?: ReactNode;
}) {
  return (
    <div id={id} className={classes.row}>
      <span className={classes.glyph} data-hue={hue}>
        <Icon size={17} strokeWidth={2.1} />
      </span>
      <div className={classes.text}>
        <div className={classes.titleRow}>
          <span className={classes.title} data-danger={danger || undefined}>
            {title}
          </span>
          {status}
        </div>
        {description && <p className={classes.description}>{description}</p>}
      </div>
      {action && <div className={classes.action}>{action}</div>}
      {children && <div className={classes.extra}>{children}</div>}
    </div>
  );
}

export function SecurityLinkRow({
  icon: Icon,
  label,
  busy = false,
  onClick,
}: {
  icon: LucideIcon;
  label: ReactNode;
  busy?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={classes.linkRow} disabled={busy} onClick={onClick}>
      <Icon size={16} />
      {label}
    </button>
  );
}
