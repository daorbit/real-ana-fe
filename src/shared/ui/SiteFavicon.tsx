import { useState } from "react";
import { Box } from "@mantine/core";
import { BrandIcon } from "@/shared/ui/BrandIcon";
import type { FrameworkId } from "@/features/workspace/frameworks";

/**
 * A site's favicon, fetched straight from the site's own domain.
 *
 * Deliberately not routed through a favicon service: those see every domain a
 * customer tracks, which sits badly with a product whose pitch is that no
 * third party watches your visitors.
 *
 * The cost is a lower hit rate, since the icon can only be guessed at by
 * convention rather than read from the page's <link rel="icon">. Several
 * conventional paths are tried in turn, and the framework logo is the fallback
 * rather than an error state — a site with no icon at any of them is normal.
 */
/**
 * Where to look, in order.
 *
 * `/favicon.ico` alone missed a large share of sites: the convention has moved
 * to PNG, and plenty of hosts — including this product's own — declare
 * `<link rel="icon" href="/favicon.png">` and return 404 for the .ico. Trying
 * the PNG paths after it costs one extra request only on the sites where the
 * first already failed.
 */
const ICON_PATHS = [
  "/favicon.ico",
  "/favicon.png",
  "/apple-touch-icon.png",
] as const;

export function SiteFavicon({
  domain,
  framework,
  size = 20,
}: {
  domain: string;
  framework?: string;
  size?: number;
}) {
  // Which candidate is being tried. Past the end means every path 404'd and the
  // framework mark stands in.
  const [attempt, setAttempt] = useState(0);
  // Reset when the component is pointed at a different site, so one domain's
  // failures do not carry over and hide an icon the next one does serve.
  const [seen, setSeen] = useState(domain);
  if (seen !== domain) {
    setSeen(domain);
    setAttempt(0);
  }

  const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const showFallback = attempt >= ICON_PATHS.length || !clean;

  return (
    <Box
      style={{
        width: size,
        height: size,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
      }}
    >
      {showFallback ? (
        <BrandIcon framework={(framework as FrameworkId) ?? "other"} size={size} />
      ) : (
        <img
          // Keyed on the path so a failed attempt actually remounts the element
          // and requests the next candidate — React would otherwise reuse the
          // node and never re-run the load for a changed src alone.
          key={ICON_PATHS[attempt]}
          src={`https://${clean}${ICON_PATHS[attempt]}`}
          alt=""
          width={size}
          height={size}
          // Decorative — the site name sits right beside it.
          aria-hidden="true"
          loading="lazy"
          // A missing favicon is the common case, not an error worth logging.
          // Step to the next candidate; past the last one the fallback shows.
          onError={() => setAttempt((n) => n + 1)}
          referrerPolicy="no-referrer"
          style={{ width: size, height: size, objectFit: "contain", borderRadius: 3 }}
        />
      )}
    </Box>
  );
}
