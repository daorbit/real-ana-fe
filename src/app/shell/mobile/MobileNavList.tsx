import { Link } from "react-router-dom";
import { ChevronRight, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { prefetchRoute } from "@/app/routePrefetch";
import type { NavGroup } from "../navItems";
import { LinkLogo } from "../LinkLogo";
import classes from "./MobileMoreSheet.module.css";

export function MobileNavList({ group, pathname }: { group: NavGroup; pathname: string }) {
  const { t } = useTranslation();

  return (
    <section className={classes.section}>
      <h3 className={classes.groupLabel}>{t(group.headingKey, group.heading)}</h3>
      <div className={classes.card}>
        {group.items.map(({ to, labelKey, label, icon: Icon, external, linkUrl, logoUrl }, i) => {
          if (external) {
            return (
              <a key={`${i}-${to}`} href={to} target="_blank" rel="noopener noreferrer" className={classes.row}>
                <span className={classes.icon}>
                  <LinkLogo url={to} logoUrl={logoUrl} label={label} size={16} />
                </span>
                <span className={classes.label}>{label}</span>
                <ExternalLink size={15} className={classes.chevron} />
              </a>
            );
          }
          const active = pathname === to || pathname.startsWith(`${to}/`);
          return (
            <Link
              key={to}
              to={to}
              className={classes.row}
              data-active={active || undefined}
              aria-current={active ? "page" : undefined}
              onTouchStart={() => void prefetchRoute(to)}
              onFocus={() => void prefetchRoute(to)}
            >
              <span className={classes.icon}>
                {linkUrl ? <LinkLogo url={linkUrl} logoUrl={logoUrl} label={label} size={16} /> : <Icon size={16} />}
              </span>
              <span className={classes.label}>{linkUrl ? label : t(labelKey, label)}</span>
              <ChevronRight size={16} className={classes.chevron} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
