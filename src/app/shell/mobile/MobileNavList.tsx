import { Fragment } from "react";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { NavGroup } from "../navItems";
import { LinkLogo } from "../LinkLogo";
import { NavItemIcon } from "../NavItemIcon";
import { MobileNavRow, isActivePath } from "./MobileNavRow";
import classes from "./MobileMoreSheet.module.css";

export function MobileNavList({ group, pathname }: { group: NavGroup; pathname: string }) {
  const { t } = useTranslation();

  return (
    <section className={classes.section}>
      <h3 className={classes.groupLabel}>{t(group.headingKey, group.heading)}</h3>
      <div className={classes.card}>
        {group.items.map((item, i) => {
          const { to, labelKey, label, external, linkUrl, logoUrl, children } = item;
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
          return (
            <Fragment key={to}>
              <MobileNavRow
                to={to}
                label={linkUrl ? label : t(labelKey, label)}
                icon={linkUrl ? <LinkLogo url={linkUrl} logoUrl={logoUrl} label={label} size={16} /> : <NavItemIcon item={item} size={16} />}
                active={isActivePath(pathname, to) && !children?.some((sub) => isActivePath(pathname, sub.to))}
              />
              {children?.map((sub) => {
                const Icon = sub.icon;
                return (
                  <MobileNavRow
                    key={sub.to}
                    to={sub.to}
                    label={t(sub.labelKey, sub.label)}
                    icon={<Icon size={15} />}
                    active={isActivePath(pathname, sub.to)}
                    child
                  />
                );
              })}
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
