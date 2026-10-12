import { UnstyledButton } from "@mantine/core";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import classes from "./DemoCallBanner.module.css";

export function DemoCallBanner({ onOpen }: { onOpen: () => void }) {
  const { t } = useTranslation();

  return (
    <UnstyledButton type="button" className={classes.banner} onClick={onOpen}>
      <span className={classes.text}>
        <span className={classes.title}>{t("nav.demoCallTitle", "Book a 1:1 demo call")}</span>
        <span className={classes.sub}>{t("nav.demoCallSub", "We’ll set up Quantalog with you")}</span>
      </span>
      <ChevronRight size={16} className={classes.arrow} />
    </UnstyledButton>
  );
}
