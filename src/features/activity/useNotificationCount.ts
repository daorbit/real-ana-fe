import { useGetNotificationCountQuery } from "@/app/store";
import { useAuth } from "@/features/auth/context";
import { useDemo } from "@/features/demo/context";
import { demoNotificationCount } from "@/features/demo/demoNotifications";


export const NOTIFICATION_POLL_MS = 30_000;


export function useNotificationCount() {
  const { user } = useAuth();
  const { demo } = useDemo();

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

  // The real query keeps polling underneath, same as the stats hook, so the
  // badge is back to the true count the instant demo mode is switched off.
  if (demo) return { count: demoNotificationCount().count, isLoading: false };

  return { count: data?.count ?? 0, isLoading };
}
