import { Group, Box } from "@mantine/core";
import { CalendarClock, Send, BarChart3, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

/** The strip's order is `TAB_ORDER`; the page owns which one is active. */
const STEPS = [
  { id: "schedule", Icon: CalendarClock, key: "tabSchedule" },
  { id: "delivery", Icon: Send, key: "tabDelivery" },
  { id: "content", Icon: BarChart3, key: "tabContent" },
] as const;

/**
 * Numbered steps rather than plain tabs: creating a report is a walkthrough,
 * and the numbers say how much is left. Every step stays clickable so editing
 * can jump straight to the one field it came for.
 */
export function ReportSteps({
  tab,
  tabIndex,
  setTab,
}: {
  tab: string;
  tabIndex: number;
  setTab: (t: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <Group
      className="share-post-row report-steps"
      gap={0}
      wrap="nowrap"
      style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
    >
      {STEPS.map((s, i) => {
        const on = s.id === tab;
        const done = i < tabIndex;
        return (
          <Box
            key={s.id}
            component="button"
            type="button"
            onClick={() => setTab(s.id)}
            aria-current={on}
            className="report-step"
            data-state={done ? "done" : on ? "current" : "todo"}
          >
            <span className="report-step-num">
              {done ? <Check size={12} strokeWidth={3} /> : i + 1}
            </span>
            {t(`reports.${s.key}`)}
          </Box>
        );
      })}
    </Group>
  );
}
