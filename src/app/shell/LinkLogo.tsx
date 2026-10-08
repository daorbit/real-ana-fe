import { useEffect, useState } from "react";
import classes from "./LinkLogo.module.css";

function faviconFor(url: string): string | null {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
  } catch {
    return null;
  }
}

export function LinkLogo({
  url,
  logoUrl,
  label,
  size = 16,
}: {
  url: string;
  logoUrl?: string;
  label: string;
  size?: number;
}) {
  const sources = [logoUrl, faviconFor(url)].filter((s): s is string => Boolean(s));
  const [index, setIndex] = useState(0);

  useEffect(() => setIndex(0), [logoUrl, url]);

  const src = sources[index];
  const sizeClass = size >= 28 ? classes.lg : size >= 20 ? classes.md : classes.sm;

  if (!src) {
    return (
      <span className={`${classes.mono} ${sizeClass}`} aria-hidden>
        {label.trim().charAt(0).toUpperCase() || "•"}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      className={`${classes.img} ${sizeClass}`}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setIndex((i) => i + 1)}
    />
  );
}
