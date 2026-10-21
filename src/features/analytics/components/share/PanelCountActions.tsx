import { Button } from "@mantine/core";
import { useTranslation } from "react-i18next";

export function PanelCountActions({ on, total, onSetAll }: { on: number; total: number; onSetAll: (next: boolean) => void }) {
  const { t } = useTranslation();
  return (
    <>
      <span>{t("share.onOf", { on, total })}</span>
      <Button size="compact-xs" variant="subtle" color="gray" disabled={on === total} onClick={() => onSetAll(true)}>
        {t("share.all")}
      </Button>
      <Button size="compact-xs" variant="subtle" color="gray" disabled={on === 0} onClick={() => onSetAll(false)}>
        {t("share.none")}
      </Button>
    </>
  );
}
