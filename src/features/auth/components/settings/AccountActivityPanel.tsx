import { History } from "lucide-react";
import { SettingsCard } from "./SettingsCard";
import { useAccountActivity } from "@/features/audit/hooks/useAccountActivity";
import { AccountActivityList } from "@/features/audit/components/AccountActivityList";
import { AuditRowsSkeleton } from "@/features/audit/components/AuditSkeleton";
import { ErrorState } from "@/shared/ui/ErrorState";

export function AccountActivityPanel() {
  const { items, hasMore, loading, loadingMore, failed, loadMore, retry } = useAccountActivity();

  return (
    <SettingsCard
      icon={History}
      title="Account activity"
      description="Sign-ins and security changes on your account, with the device and place they came from. Kept for 400 days."
    >
      {loading ? (
        <AuditRowsSkeleton rows={3} flat />
      ) : failed ? (
        <ErrorState compact title="Couldn't load your activity" onRetry={retry} />
      ) : (
        <AccountActivityList items={items} hasMore={hasMore} loadingMore={loadingMore} onLoadMore={loadMore} />
      )}
    </SettingsCard>
  );
}
