import { UnstyledButton } from "@mantine/core";
import { num } from "@/shared/lib";
import type { SearchInsightRow } from "@/shared/types";
import { METRIC_BY_KEY } from "../searchMetrics";
import { SearchCardHead } from "./SearchSectionHead";
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
      <SearchCardHead
        title="Questions people ask"
        description={
          total
            ? `${num(total)} question searches show your site. Answer them on the page to win more of them.`
            : "Question searches your site appears for will show here."
        }
      />

      {rows.length === 0 ? (
        <span className={classes.moverEmpty}>No question searches in this period.</span>
      ) : (
        <div className={classes.questions}>
          {rows.map((row) => (
            <UnstyledButton key={row.key} className={classes.question} onClick={() => onOpen(row.key)} title={row.key}>
              <span className={classes.questionText}>{row.key}</span>
              <span className={classes.questionMeta}>
                {num(row.clicks)} clicks · position {METRIC_BY_KEY.position.format(row.position)}
              </span>
            </UnstyledButton>
          ))}
        </div>
      )}
    </section>
  );
}
