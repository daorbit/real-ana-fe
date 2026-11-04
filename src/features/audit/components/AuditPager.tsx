import { Button, Loader } from "@mantine/core";
import classes from "./AuditLog.module.css";

export function AuditPager({
  page,
  pages,
  total,
  limit,
  loading,
  onChange,
}: {
  page: number;
  pages: number;
  total: number;
  limit: number;
  loading: boolean;
  onChange: (page: number) => void;
}) {
  if (pages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <nav className={classes.pager} aria-label="Pages">
      <span className={classes.pagerLabel}>
        {from.toLocaleString()}–{to.toLocaleString()} of {total.toLocaleString()}
        {loading && <Loader size={13} />}
      </span>
      <span className={classes.pagerButtons}>
        <Button variant="default" size="xs" radius={10} disabled={loading || page <= 1} onClick={() => onChange(page - 1)}>
          Previous
        </Button>
        <Button variant="default" size="xs" radius={10} disabled={loading || page >= pages} onClick={() => onChange(page + 1)}>
          Next
        </Button>
      </span>
    </nav>
  );
}
