import { useEffect, useRef } from "react";
import { useClaimReferralMutation } from "@/app/store";
import { useAuth } from "@/features/auth/context";
import { clearPendingRef, readPendingRef } from "../lib/pendingRef";

export function useClaimPendingReferral() {
  const { user, isDemo } = useAuth();
  const [claim] = useClaimReferralMutation();
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current || !user || isDemo || user.impersonating) return;
    const code = readPendingRef();
    if (!code) return;
    attempted.current = true;
    claim(code)
      .unwrap()
      .catch(() => undefined)
      .finally(clearPendingRef);
  }, [user, isDemo, claim]);
}
