import { useMemo } from "react";
import { Box } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { timeAgo } from "@/shared/lib/format";
import type { ApiKey } from "@/shared/types";
import { keyStatus } from "../../developers";
import classes from "./Developers.module.css";

export function KeyStats({ keys }: { keys: ApiKey[] }) {
  const { t } = useTranslation();

  const stats = useMemo(() => {
    const statuses = keys.map(keyStatus);
    const lastUsed = keys.reduce<string | undefined>(
      (latest, k) =>
        k.lastUsedAt && (!latest || new Date(k.lastUsedAt) > new Date(latest)) ? k.lastUsedAt : latest,
      undefined,
    );
    return {
      active: statuses.filter((s) => s !== "expired").length,
      expiring: statuses.filter((s) => s === "expiring").length,
      expired: statuses.filter((s) => s === "expired").length,
      lastUsed,
    };
  }, [keys]);

  const items = [
    { label: t("developers.statActive"), value: String(stats.active) },
    {
      label: t("developers.statExpiring"),
      value: String(stats.expiring),
      tone: stats.expiring > 0 ? "warn" : undefined,
    },
    {
      label: t("developers.statExpired"),
      value: String(stats.expired),
      tone: stats.expired > 0 ? "danger" : undefined,
    },
    {
      label: t("developers.statLastRequest"),
      value: stats.lastUsed ? timeAgo(stats.lastUsed) : t("developers.neverUsed"),
    },
  ];

  return (
    <Box className={classes.stats}>
      {items.map((item) => (
        <div key={item.label} className={classes.stat}>
          <span className={classes.statLabel}>{item.label}</span>
          <span className={classes.statValue} data-tone={item.tone}>
            {item.value}
          </span>
        </div>
      ))}
    </Box>
  );
}
