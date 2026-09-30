import { useState } from "react";
import { Globe } from "lucide-react";

/**
 * Flags are static SVGs in `public/flags`, requested only when a flag is on
 * screen. Flag emoji are not an option: Windows ships no flag glyphs, so they
 * render as two plain letters ("IN", "AR").
 */
export function CountryFlag({ code, size = 18 }: { code: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const slug = code.toLowerCase();

  if (failed || !/^[a-z]{2}$/.test(slug) || slug === "xx") {
    return <Globe aria-hidden size={size} style={{ flexShrink: 0, opacity: 0.55 }} />;
  }

  return (
    <img
      alt=""
      aria-hidden
      loading="lazy"
      src={`/flags/${slug}.svg`}
      width={Math.round(size * 1.33)}
      height={size}
      onError={() => setFailed(true)}
      style={{ flexShrink: 0, borderRadius: 3, objectFit: "cover", boxShadow: "0 0 0 1px rgba(128,128,128,0.28)" }}
    />
  );
}
