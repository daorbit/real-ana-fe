import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { COUPON_PARAM } from "../lib/constants";

const VALID_CODE = /^[A-Z0-9_-]{2,40}$/;

export function useCouponIntent(): string | undefined {
  const [params, setParams] = useSearchParams();
  const raw = params.get(COUPON_PARAM);
  const [code, setCode] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!raw) return;
    const cleaned = raw.trim().toUpperCase();
    if (VALID_CODE.test(cleaned)) setCode(cleaned);
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete(COUPON_PARAM);
        return next;
      },
      { replace: true },
    );
  }, [raw, setParams]);

  return code;
}
