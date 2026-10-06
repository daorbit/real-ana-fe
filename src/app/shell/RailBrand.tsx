import { ActionIcon, Tooltip, UnstyledButton } from "@mantine/core";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import classes from "./Rail.module.css";

export function RailBrand({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const label = collapsed
    ? t("nav.expandRail", "Expand sidebar")
    : t("nav.collapseRail", "Collapse sidebar");

  if (collapsed) {
    return (
      <Tooltip label={label} position="right" withArrow openDelay={200}>
        <UnstyledButton className={classes.brandToggle} onClick={onToggle} aria-label={label} aria-expanded={false}>
          <img src="/brand-mark.png" alt="" aria-hidden className={classes.brandMark} />
          <span className={classes.brandExpand} aria-hidden>
            <PanelLeftOpen size={18} />
          </span>
        </UnstyledButton>
      </Tooltip>
    );
  }

  return (
    <Tooltip label={label} position="right" withArrow openDelay={200}>
      <ActionIcon variant="subtle" color="gray" size="md" onClick={onToggle} aria-label={label} aria-expanded>
        <PanelLeftClose size={17} />
      </ActionIcon>
    </Tooltip>
  );
}
