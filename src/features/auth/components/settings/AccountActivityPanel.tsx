import { SecurityGroup } from "./SecurityGroup";
import { useAccountActivity } from "@/features/audit/hooks/useAccountActivity";
import { AccountActivityList } from "@/features/audit/components/AccountActivityList";
import { AuditRowsSkeleton } from "@/features/audit/components/AuditSkeleton";
import { ErrorState } from "@/shared/ui/ErrorState";
import classes from "./Security.module.css";

export function AccountActivityPanel() {
  const { items, hasMore, loading, loadingMore, failed, loadMore, retry } = useAccountActivity();

  return (
    <SecurityGroup
      label="Account activity"
      footer="Sign-ins and security changes, with the device and place they came from. Kept for 400 days."
    >
      <div className={classes.activity}>
        {loading ? (
          <AuditRowsSkeleton rows={3} flat />
        ) : failed ? (
          <ErrorState compact title="Couldn't load your activity" onRetry={retry} />
        ) : (
          <AccountActivityList items={items} hasMore={hasMore} loadingMore={loadingMore} onLoadMore={loadMore} />
        )}
      </div>
    </SecurityGroup>
  );
}
