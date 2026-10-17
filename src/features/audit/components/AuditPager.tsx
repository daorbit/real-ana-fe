import { Loader, Pagination } from "@mantine/core";
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
    <div className={classes.pager}>
      <span className={classes.pagerLabel}>
        {from.toLocaleString()}–{to.toLocaleString()} of {total.toLocaleString()}
      </span>
      <Pagination
        value={page}
        total={pages}
        onChange={onChange}
        size="sm"
        radius="md"
        siblings={1}
        boundaries={1}
        disabled={loading}
      />
      <span className={classes.pagerSpinner}>{loading && <Loader size={14} />}</span>
    </div>
  );
}
