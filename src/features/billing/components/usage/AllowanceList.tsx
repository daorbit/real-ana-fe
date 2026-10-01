import { Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { QuotaSummary } from "@/shared/types";
import { buildUsageMeters } from "../../lib/usageMeters";
import { AllowanceRow } from "./AllowanceRow";
import classes from "./UsageOverview.module.css";

export function AllowanceList({ usage }: { usage: NonNullable<QuotaSummary> }) {
  const { t } = useTranslation();
  const meters = buildUsageMeters(usage, t).filter((m) => m.key !== "events");

  return (
    <section className={classes.card}>
      <header className={classes.cardHead}>
        <div>
          <Text fw={650} size="sm">
            {t("billing.allowancesTitle", "Allowances this month")}
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            {t(
              "billing.allowancesSubtitle",
              "What this workspace has used of each limit. Add-on credits are drawn on once the plan's share runs out.",
            )}
          </Text>
        </div>
      </header>

      <ul className={classes.allowances}>
        {meters.map((meter) => (
          <AllowanceRow key={meter.key} meter={meter} />
        ))}
      </ul>
    </section>
  );
}
