import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { FreshLocationState } from "@/features/dashboards/hooks/useDashboardStudio";

const FRESH_MS = 2600;
const NONE: ReadonlySet<string> = new Set();

export function useFreshWidgets(): ReadonlySet<string> {
  const location = useLocation();
  const navigate = useNavigate();
  const [fresh, setFresh] = useState<ReadonlySet<string>>(NONE);
  const timer = useRef<number | undefined>(undefined);
  const incoming = (location.state as FreshLocationState)?.fresh;

  useEffect(() => {
    if (!incoming?.length) return;
    setFresh(new Set(incoming));
    navigate(location.pathname, { replace: true, state: null });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setFresh(NONE), FRESH_MS);
  }, [incoming, navigate, location.pathname]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return fresh;
}
