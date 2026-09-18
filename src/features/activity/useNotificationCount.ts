import { useGetNotificationCountQuery } from "@/app/store";
import { useAuth } from "@/features/auth/context";


export const NOTIFICATION_POLL_MS = 30_000;


export function useNotificationCount() {
  const { user } = useAuth();

  const { data, isLoading } = useGetNotificationCountQuery(undefined, {
    // Signed out, there is nothing to count and the request would 401 on a
    // timer for as long as the login screen is open.
    skip: !user,
    pollingInterval: NOTIFICATION_POLL_MS,
    // A backgrounded tab is not being looked at, and its badge can catch up the
    // moment it is. RTK Query refetches on focus anyway, which covers the
    // return.
    skipPollingIfUnfocused: true,
    refetchOnFocus: true,
  });

  return { count: data?.count ?? 0, isLoading };
}
