import { useComputedColorScheme } from "@mantine/core";

/**
 * The Orbit mark.
 *
 * Two files rather than one, because each render is lit for its own theme.
 * `useComputedColorScheme` resolves "auto" to whichever the user is actually
 * seeing, which is the thing that has to match.
 */
export function OrbitMark({
  size = 20,
  className,
}: {
  size?: number;
  /** For the callers that animate the mark — the create-form hero, and Orbit's own empty state. */
  className?: string;
}) {
  // `getInitialValueInEffect: false` — the default defers to an effect, which
  // flashes the light mark on a dark page for a frame on first paint.
  const scheme = useComputedColorScheme("dark", { getInitialValueInEffect: false });

  return (
    <img
      src={scheme === "dark" ? "/orbit-ai-dark.webp" : "/orbit-ai-light.webp"}
      alt=""
      // Decorative in every place it is used — each one already has a text
      // label or an aria-label, and "Orbit AI Orbit AI" is what a screen reader
      // would otherwise read out.
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        display: "block",
        flexShrink: 0,
        objectFit: "contain",
      }}
    />
  );
}
