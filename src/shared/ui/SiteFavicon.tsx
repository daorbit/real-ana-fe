import { useState } from "react";
import { Box } from "@mantine/core";
import { BrandIcon } from "@/shared/ui/BrandIcon";
import type { FrameworkId } from "@/features/workspace/frameworks";
import classes from "./SiteFavicon.module.css";


const ICON_PATHS = [
  "/favicon.ico",
  "/favicon.png",
  "/favicon.jpg",
  "/favicon.jpeg",
  "/apple-touch-icon.png",
] as const;

const MIN_ICON_PX = 8;
const TONES = 7;

function toneOf(domain: string): number {
  let hash = 0;
  for (const ch of domain) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return hash % TONES;
}

export function SiteFavicon({
  domain,
  framework,
  size = 20,
}: {
  domain: string;
  framework?: string;
  size?: number;
}) {

  const [attempt, setAttempt] = useState(0);

  const [seen, setSeen] = useState(domain);
  if (seen !== domain) {
    setSeen(domain);
    setAttempt(0);
  }

  const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const showFallback = attempt >= ICON_PATHS.length || !clean;
  const bare = clean.replace(/^www\./, "");

  return (
    <Box className={classes.box} w={size} h={size}>
      {showFallback ? (
        framework || !bare ? (
          <BrandIcon framework={(framework as FrameworkId) ?? "other"} size={size} />
        ) : (
          <Box component="span" className={classes.monogram} data-tone={toneOf(bare)} fz={Math.round(size * 0.58)}>
            {bare[0]}
          </Box>
        )
      ) : (
        <img

          key={ICON_PATHS[attempt]}
          src={`https://${clean}${ICON_PATHS[attempt]}`}
          alt=""
          width={size}
          height={size}
          aria-hidden="true"
          loading="lazy"
          onError={() => setAttempt((n) => n + 1)}
          onLoad={(e) => e.currentTarget.naturalWidth < MIN_ICON_PX && setAttempt((n) => n + 1)}
          referrerPolicy="no-referrer"
          className={classes.img}
        />
      )}
    </Box>
  );
}
