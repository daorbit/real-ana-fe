import { useEffect } from "react";
import { useSubscribeToPushMutation } from "@/app/store";
import { useAuth } from "@/features/auth/context";
import { currentSubscription, linkSubscription, pushSupported } from "@/features/activity/pushLink";

export function usePushSessionLink() {
  const { user } = useAuth();
  const [subscribe] = useSubscribeToPushMutation();
  const userId = user && !user.demo && !user.impersonating ? user.id : undefined;

  useEffect(() => {
    if (!userId || !pushSupported() || Notification.permission !== "granted") return;
    void currentSubscription()
      .then((sub) => (sub ? linkSubscription(sub, userId, (body) => subscribe(body).unwrap()) : false))
      .catch(() => false);
  }, [userId, subscribe]);
}
