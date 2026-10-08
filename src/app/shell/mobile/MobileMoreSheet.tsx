import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ActionIcon, UnstyledButton } from "@mantine/core";
import { ChevronRight, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import { NAV_GROUPS, type NavGroup } from "../navItems";
import { MOBILE_TAB_PATHS } from "../mobileTabs";
import { openPalette } from "../openPalette";
import { useNavPrefs } from "../navPrefs";
import { applyNavPrefs } from "../applyNavPrefs";
import { MobileNavList } from "./MobileNavList";
import classes from "./MobileMoreSheet.module.css";

const sheetGroups = (groups: NavGroup[]): NavGroup[] =>
  groups
    .map((group) => ({ ...group, items: group.items.filter((item) => !MOBILE_TAB_PATHS.has(item.to)) }))
    .filter((group) => group.items.length > 0);

export function MobileMoreSheet({
  pathname,
  onClose,
  cards,
  account,
}: {
  pathname: string;
  onClose: () => void;
  cards?: ReactNode;
  account: ReactNode;
}) {
  const { t } = useTranslation();
  const onOrbit = pathname.startsWith("/app/orbit");
  const navPrefs = useNavPrefs();
  const groups = useMemo(() => sheetGroups(applyNavPrefs(NAV_GROUPS, navPrefs)), [navPrefs]);

  return (
    <div className={classes.root}>
      <header className={classes.head}>
        <h2 className={classes.title}>{t("nav.more", "More")}</h2>
        <ActionIcon
          variant="default"
          radius="xl"
          size={32}
          onClick={onClose}
          aria-label={t("nav.closeNav", "Close navigation")}
        >
          <X size={16} />
        </ActionIcon>
      </header>

      <UnstyledButton className={classes.search} onClick={openPalette}>
        <Search size={16} />
        <span>{t("nav.search")}</span>
      </UnstyledButton>

      <div className={classes.scroll}>
        {!onOrbit && (
          <section className={classes.section}>
            <div className={classes.card}>
              <Link to="/app/orbit" className={classes.row}>
                <span className={classes.orbitIcon}>
                  <OrbitMark size={22} />
                </span>
                <span className={classes.rowText}>
                  <span className={classes.label}>{t("nav.orbit", "Orbit AI")}</span>
                  <span className={classes.hint}>{t("nav.orbitHint", "Ask anything about your analytics")}</span>
                </span>
                <ChevronRight size={16} className={classes.chevron} />
              </Link>
            </div>
          </section>
        )}

        {groups.map((group) => (
          <MobileNavList key={group.headingKey} group={group} pathname={pathname} />
        ))}

        {cards && <section className={classes.section}>{cards}</section>}

        <section className={classes.section}>
          <div className={`${classes.card} ${classes.account}`}>{account}</div>
        </section>
      </div>
    </div>
  );
}
