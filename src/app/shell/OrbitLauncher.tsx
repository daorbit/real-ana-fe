import { Link } from "react-router-dom";
import { Text, Tooltip, UnstyledButton } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { OrbitNavIcon } from "./icons";
import { prefetchRoute } from "@/app/routePrefetch";

/**
 * The way into the assistant.
 *
 * Shaped like every other rail row — same height, same hover, same active
 * wash. What sets it apart is the mark it carries and the badge on the end,
 * which is enough for the eye to find it without a box drawn around it.
 */
export function OrbitLauncher({ collapsed, active }: { collapsed: boolean; active: boolean }) {
  const { t } = useTranslation();
  const label = t("nav.orbit", "Orbit AI");

  // Collapsed there is no room for the field, so it falls back to the icon
  // every other row in the rail is wearing at this width.
  if (collapsed) {
    return (
      <Tooltip label={label} position="right" withArrow openDelay={200}>
        <UnstyledButton
          component={Link}
          to="/app/orbit"
          className="nav-link orbit-mini"
          data-collapsed
          data-active={active}
          aria-label={label}
          onMouseEnter={() => prefetchRoute("/app/orbit")}
        >
          <OrbitNavIcon size={22} />
        </UnstyledButton>
      </Tooltip>
    );
  }

  return (
    <UnstyledButton
      component={Link}
      to="/app/orbit"
      className="orbit-launcher"
      data-active={active || undefined}
      aria-current={active ? "page" : undefined}
      onMouseEnter={() => prefetchRoute("/app/orbit")}
      onFocus={() => prefetchRoute("/app/orbit")}
    >
      {/* Larger than a rail icon: this is the product's mark rather than a
          line glyph, and at 16px its detail collapses into a dot. */}
      <span className="orbit-launcher-mark" aria-hidden>
        <OrbitNavIcon size={22} />
      </span>

      <Text component="span" className="orbit-launcher-label">
        {label}
      </Text>

      <Text component="span" className="orbit-launcher-hint" aria-hidden>
        AI
      </Text>
    </UnstyledButton>
  );
}
