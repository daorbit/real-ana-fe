import { Button } from "@mantine/core";
import { RefreshCw, ShieldAlert } from "lucide-react";
import type { SeoCompetitorComparison } from "@/shared/types";
import { readIssueText } from "../lib/trust";
import classes from "./Compare.module.css";

export function UnreadableCard({
  comparison,
  canEdit,
  refreshing,
  onRefresh,
}: {
  comparison: SeoCompetitorComparison;
  canEdit: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  if (!comparison.readIssue) return null;

  return (
    <section className={`${classes.card} ${classes.unreadable} glass`}>
      <span className={classes.unreadableIcon}><ShieldAlert size={20} /></span>
      <h3 className={classes.cardTitle}>We could not read this page</h3>
      <p className={classes.unreadableText}>{readIssueText(comparison.readIssue, comparison.snapshot.statusCode)}</p>
      <p className={classes.unreadableText}>
        Try a different page on their site, such as a product or blog page. Bot protection is usually strictest on the homepage.
      </p>
      {canEdit && (
        <Button
          variant="default"
          radius="md"
          size="sm"
          leftSection={<RefreshCw size={14} />}
          loading={refreshing}
          onClick={onRefresh}
        >
          Try again
        </Button>
      )}
    </section>
  );
}
