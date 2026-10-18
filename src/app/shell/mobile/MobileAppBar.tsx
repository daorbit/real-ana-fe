import { AppShell, UnstyledButton } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { ChevronLeft } from "lucide-react";
import { ActivityBellIcon } from "@/features/activity/ActivityBell";
import { HeaderDocsButton } from "@/shared/ui/DocsButton";
import { HeaderHelpButton } from "@/shared/ui/PageHelpButton";
import { usePageName } from "@/shared/lib/useTitle";
import { RailWorkspaceHeader } from "../RailWorkspaceHeader";
import { useMobileBack } from "./useMobileBack";
import classes from "./MobileAppBar.module.css";

export function MobileAppBar({ pathname, scrolled }: { pathname: string; scrolled: boolean }) {
  const { t } = useTranslation();
  const { parent, goBack } = useMobileBack(pathname);
  const pageName = usePageName();

  const parentLabel = parent ? (parent.linkUrl ? parent.label : t(parent.labelKey, parent.label)) : "";

  return (
    <AppShell.Header hiddenFrom="sm" className={`m-header ${classes.bar}`} data-scrolled={scrolled || undefined}>
      <div className={classes.row}>
        {parent ? (
          <div className={classes.detail}>
            <UnstyledButton className={classes.back} onClick={goBack} aria-label={t("common.back", "Back")}>
              <ChevronLeft size={26} strokeWidth={2.1} />
            </UnstyledButton>
            <div className={classes.detailText}>
              <span className={classes.detailTitle}>{pageName ?? parentLabel}</span>
              {pageName && pageName !== parentLabel && <span className={classes.detailParent}>{parentLabel}</span>}
            </div>
          </div>
        ) : (
          <div className={classes.workspace}>
            <RailWorkspaceHeader collapsed={false} title={pageName} />
          </div>
        )}
        <div className="m-header__bell">
          <HeaderHelpButton />
          <HeaderDocsButton />
          <ActivityBellIcon variant="subtle" size="lg" iconSize={20} withTooltip={false} />
        </div>
      </div>
    </AppShell.Header>
  );
}
