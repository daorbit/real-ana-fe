import { Text, UnstyledButton } from "@mantine/core";
import { MessageCircleQuestion } from "lucide-react";
import { num } from "@/shared/lib";
import type { SearchInsightRow } from "@/shared/types";
import { METRIC_BY_KEY } from "../searchMetrics";
import classes from "./insights.module.css";

export function InsightQuestions({
  rows,
  total,
  onOpen,
}: {
  rows: SearchInsightRow[];
  total: number;
  onOpen: (query: string) => void;
}) {
  return (
    <section className={classes.panel}>
      <header className={classes.panelHead}>
        <div>
          <Text fw={650} size="sm">
            Questions people ask
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            {total
              ? `${num(total)} question searches show your site. Answer them clearly on the page to win the click.`
              : "Question searches your site appears for will show here."}
          </Text>
        </div>
      </header>

      {rows.length === 0 ? (
        <Text size="xs" c="dimmed">
          No question searches in this period.
        </Text>
      ) : (
        <div className={classes.questions}>
          {rows.map((row) => (
            <UnstyledButton key={row.key} className={classes.question} onClick={() => onOpen(row.key)} title={row.key}>
              <MessageCircleQuestion size={14} className={classes.questionIcon} />
              <span className={classes.questionText}>{row.key}</span>
              <span className={classes.questionMeta}>
                {num(row.impressions)} · #{METRIC_BY_KEY.position.format(row.position)}
              </span>
            </UnstyledButton>
          ))}
        </div>
      )}
    </section>
  );
}
