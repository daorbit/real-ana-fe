import { useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import classes from "./seoUi.module.css";

export function SeoList({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={`${classes.list} ${className ?? ""}`}>{children}</div>;
}

export function ListHead({ children }: { children: ReactNode }) {
  return <div className={classes.listHead}>{children}</div>;
}

export function ListTitle({ children }: { children: ReactNode }) {
  return <div className={`${classes.row} ${classes.listTitle}`}>{children}</div>;
}

export function ListRow({
  lead,
  title,
  sub,
  clip = false,
  aside,
  top = false,
}: {
  lead?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  clip?: boolean;
  aside?: ReactNode;
  top?: boolean;
}) {
  return (
    <div className={classes.row} data-top={top || undefined}>
      {lead}
      <div className={classes.rowMain}>
        <span className={sub ? classes.rowTitle : classes.rowText}>{title}</span>
        {sub && (
          <span className={classes.rowSub} data-clip={clip || undefined}>
            {sub}
          </span>
        )}
      </div>
      {aside}
    </div>
  );
}

export function ListEmpty({ children }: { children: ReactNode }) {
  return <div className={classes.empty}>{children}</div>;
}

export function Disclosure({
  lead,
  title,
  sub,
  aside,
  defaultOpen = false,
  children,
}: {
  lead?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  aside?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={classes.disclosure} data-open={open || undefined}>
      <button type="button" className={classes.disclosureHead} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {lead}
        <span className={classes.rowMain}>
          <span className={classes.rowTitle}>{title}</span>
          {sub && (
            <span className={classes.rowSub} data-clip>
              {sub}
            </span>
          )}
        </span>
        {aside}
        <ChevronRight size={14} className={classes.chevron} aria-hidden />
      </button>
      {open && (
        <div className={classes.disclosureBody} data-flat={!lead || undefined}>
          {children}
        </div>
      )}
    </div>
  );
}

export function DisclosureText({ label, children }: { label?: string; children?: ReactNode }) {
  return (
    <>
      {label && <span className={classes.bodyLabel}>{label}</span>}
      {children != null && <span className={classes.bodyText}>{children}</span>}
    </>
  );
}

export function DisclosureActions({ children }: { children: ReactNode }) {
  return <div className={classes.bodyActions}>{children}</div>;
}
