import { useState } from "react";
import { Box } from "@mantine/core";
import { BrandIcon } from "./BrandIcon";
import type { FrameworkId } from "../utils/frameworks";

/**
 * A site's favicon, fetched straight from the site's own domain.
 *
 * Deliberately not routed through a favicon service: those see every domain a
 * customer tracks, which sits badly with a product whose pitch is that no
 * third party watches your visitors. The cost is a lower hit rate — sites that
 * only declare an icon via <link rel="icon"> and serve nothing at
 * /favicon.ico will miss — so the framework logo is the fallback rather than
 * an error state.
 */
export function SiteFavicon({
  domain,
  framework,
  size = 20,
}: {
  domain: string;
  framework?: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const showFallback = failed || !clean;

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
          src={`https://${clean}/favicon.ico`}
          alt=""
          width={size}
          height={size}
          // Decorative — the site name sits right beside it.
          aria-hidden="true"
          loading="lazy"
          // A missing favicon is the common case, not an error worth logging.
          onError={() => setFailed(true)}
          referrerPolicy="no-referrer"
          style={{ width: size, height: size, objectFit: "contain", borderRadius: 3 }}
        />
      )}
    </Box>
  );
}
