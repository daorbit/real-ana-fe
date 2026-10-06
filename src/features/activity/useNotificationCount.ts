import { useGetNotificationCountQuery } from "@/app/store";
import { useAuth } from "@/features/auth/context";
import { useDemo } from "@/features/demo/context";
import { demoNotificationCount } from "@/features/demo/demoNotifications";
import { useRefetchOnFocus } from "@/shared/hooks/useRefetchOnFocus";


export const NOTIFICATION_POLL_MS = 30_000;
const NOTIFICATION_FOCUS_STALE_MS = 15_000;


export function useNotificationCount() {
  const { user } = useAuth();
  const { demo } = useDemo();

  const { data, isLoading, refetch, fulfilledTimeStamp } = useGetNotificationCountQuery(undefined, {
    // Signed out, there is nothing to count and the request would 401 on a
    // timer for as long as the login screen is open.
    skip: !user || demo,
    pollingInterval: NOTIFICATION_POLL_MS,
    // A backgrounded tab is not being looked at, and its badge can catch up the
    // moment it is.
    skipPollingIfUnfocused: true,
  });

  useRefetchOnFocus(refetch, fulfilledTimeStamp, NOTIFICATION_FOCUS_STALE_MS, Boolean(user) && !demo);

  if (demo) return { count: demoNotificationCount().count, isLoading: false };

  return { count: data?.count ?? 0, isLoading };
}
