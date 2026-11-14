import { useMemo } from "react";
import { useAuth } from "@/features/auth/context";
import { guessCountry, splitNumber, type DialCode } from "@/shared/lib/dialCodes";

export function useHomeDialCode(): DialCode {
  const { user } = useAuth();
  const mobile = user?.mobile ?? "";
  return useMemo(() => (mobile ? splitNumber(mobile).country : guessCountry()), [mobile]);
}
