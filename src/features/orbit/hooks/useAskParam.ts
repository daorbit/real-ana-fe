import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const ORBIT_ASK_PARAM = "ask";

export function orbitAskPath(question: string): string {
  return `/app/orbit?${ORBIT_ASK_PARAM}=${encodeURIComponent(question)}`;
}

export function useAskParam(setInput: (value: string) => void) {
  const [searchParams, setSearchParams] = useSearchParams();
  const ask = searchParams.get(ORBIT_ASK_PARAM);

  useEffect(() => {
    if (!ask) return;
    setInput(ask);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete(ORBIT_ASK_PARAM);
        return next;
      },
      { replace: true },
    );
  }, [ask, setInput, setSearchParams]);
}
