import {
  siNextdotjs, siReact, siVuedotjs, siWordpress, siShopify, siWebflow, siHtml5,
} from "simple-icons";
import { Globe } from "lucide-react";
import type { FrameworkId } from "../utils/frameworks";

/**
 * Official brand marks for the frameworks we offer install guides for.
 *
 * These are the real logos from simple-icons rather than generic glyphs — a
 * picker of look-alike shapes makes people hesitate about whether they picked
 * the right thing.
 */
const ICONS: Partial<Record<FrameworkId, { path: string; hex: string; title: string }>> = {
  nextjs: siNextdotjs,
  react: siReact,
  vue: siVuedotjs,
  wordpress: siWordpress,
  shopify: siShopify,
  webflow: siWebflow,
  html: siHtml5,
};

/**
 * Brands whose official colour is pure black, which disappears on our dark
 * surfaces. They render in the current text colour instead, so the mark stays
 * legible in both themes.
 */
const MONOCHROME = new Set<FrameworkId>(["nextjs"]);

export function BrandIcon({
  framework,
  size = 22,
  /** Render in the current text colour rather than the brand colour. */
  muted = false,
}: {
  framework: FrameworkId;
  size?: number;
  muted?: boolean;
}) {
  const icon = ICONS[framework];

  // "Other" and anything unmapped: a neutral glyph, not a broken slot.
  if (!icon) {
    return <Globe size={size} style={{ color: "var(--muted)" }} aria-hidden="true" />;
  }

  const fill = muted || MONOCHROME.has(framework) ? "currentColor" : `#${icon.hex}`;

  return (
    <svg
      role="img"
      aria-label={icon.title}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={fill}
      style={{ flexShrink: 0, display: "block" }}
    >
      <path d={icon.path} />
    </svg>
  );
}
