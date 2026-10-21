import { useEffect, useState } from "react";
import { isLocked, subscribeLock } from "@/shared/lib/lockState";

export function useScreenLocked(): boolean {
  const [locked, setLocked] = useState(isLocked());
  useEffect(() => subscribeLock(setLocked), []);
  return locked;
}
