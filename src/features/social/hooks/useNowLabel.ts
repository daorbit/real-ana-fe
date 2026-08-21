import { useEffect, useState } from "react";
import { nowLabel } from "../components/draft";

/**
 * The current time in a zone, kept current.
 *
 * The composer stays open for minutes at a time while someone writes, so a
 * clock rendered once would quietly go stale — and a chip offering to schedule
 * for a time that has already passed is worse than no chip. Ticks on the
 * minute boundary rather than every second: the label has minute resolution,
 * and a timer firing sixty times as often to change nothing is waste.
 */
export function useNowLabel(timezone: string): string {
  const [label, setLabel] = useState(() => nowLabel(timezone));

  useEffect(() => {
    setLabel(nowLabel(timezone));

    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      setLabel(nowLabel(timezone));
      // Re-aimed at the next minute each time rather than a fixed 60s
      // interval, which would drift out of step with the clock it displays.
      timer = setTimeout(tick, msToNextMinute());
    };

    timer = setTimeout(tick, msToNextMinute());
    return () => clearTimeout(timer);
  }, [timezone]);

  return label;
}

function msToNextMinute(): number {
  const now = new Date();
  return (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
}
