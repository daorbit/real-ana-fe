import { useEffect, useState } from "react";
import { Globe } from "lucide-react";

/**
 * Flags are bundled SVGs, fetched one file at a time so only the flags on
 * screen are ever downloaded. Flag emoji are not an option: Windows ships no
 * flag glyphs, so they render as two plain letters ("IN", "AR").
 */
const FLAGS = import.meta.glob<string>("/node_modules/flag-icons/flags/4x3/*.svg", {
  query: "?url",
  import: "default",
});

const cache = new Map<string, string | null>();

function loadFlag(code: string): Promise<string | null> {
  const key = code.toLowerCase();
  const hit = cache.get(key);
  if (hit !== undefined) return Promise.resolve(hit);
  if (key === "xx") return Promise.resolve(null);
  const load = FLAGS[`/node_modules/flag-icons/flags/4x3/${key}.svg`];
  if (!load) return Promise.resolve(null);
  return load().then(
    (url) => (cache.set(key, url), url),
    () => null,
  );
}

export function CountryFlag({ code, size = 18 }: { code: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(() => cache.get(code.toLowerCase()) ?? null);

  useEffect(() => {
    let live = true;
    if (/^[A-Za-z]{2}$/.test(code)) void loadFlag(code).then((url) => live && setSrc(url));
    else setSrc(null);
    return () => {
      live = false;
    };
  }, [code]);

  if (!src) return <Globe aria-hidden size={size} style={{ flexShrink: 0, opacity: 0.55 }} />;
  return (
    <img
      alt=""
      aria-hidden
      src={src}
      width={Math.round(size * 1.33)}
      height={size}
      style={{ flexShrink: 0, borderRadius: 3, objectFit: "cover", boxShadow: "0 0 0 1px rgba(128,128,128,0.28)" }}
    />
  );
}
