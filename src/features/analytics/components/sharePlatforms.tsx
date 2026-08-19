import { siX, siWhatsapp, siFacebook, siTelegram } from "simple-icons";

/**
 * The networks the share panel can hand a post to, and the mechanics of
 * getting a caption to them.
 *
 * Split out of the panel itself: the preview mock and the LinkedIn connection
 * both need the platform table, and none of it is about the panel's layout.
 */

/**
 * LinkedIn's mark, inline.
 *
 * simple-icons dropped it over trademark policy, so it is the one glyph we
 * carry ourselves rather than leaving the most-used tab without a logo.
 */
export const LINKEDIN_ICON = {
  hex: "0A66C2",
  path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
};

/**
 * A plain link, styled as a platform so it can share the tab strip.
 *
 * Not a network: the "Link" tab copies the public dashboard URL rather than
 * opening anyone's composer. It carries a neutral hex so the active tab's
 * underline has a colour like every other tab, and no `intent` is ever called
 * for it — the panel handles that tab before it reaches the share path.
 */
export const LINK_ICON = {
  hex: "6B7280",
  // Drawn to fill the 24x24 box, like the brand marks it sits beside. The
  // previous path floated in the middle of its viewBox, so at the same `size`
  // as LinkedIn's mark it rendered visibly smaller than every other tab's icon.
  path: "M3.9 12a5.1 5.1 0 0 1 5.1-5.1h4.2v2.4H9A2.7 2.7 0 0 0 9 14.7h4.2v2.4H9A5.1 5.1 0 0 1 3.9 12zm6.9-1.2h6.6v2.4h-6.6v-2.4zM15 6.9h4.2a5.1 5.1 0 0 1 0 10.2H15v-2.4h4.2a2.7 2.7 0 0 0 0-5.4H15V6.9z",
};

/** The networks the composer can hand a post to, plus the plain-link tab. */
export type PlatformId = "linkedin" | "link" | "facebook" | "twitter" | "whatsapp" | "telegram";

export type Platform = {
  id: PlatformId;
  label: string;
  icon: { path: string; hex: string };
  /** Feed-composer character budget. `null` where there is no meaningful cap. */
  limit: number | null;
  /** Hashtag budget for the counter, where the network publishes one. */
  hashtagLimit: number | null;
  /**
   * Build the share-intent URL.
   *
   * LinkedIn and Facebook are the odd ones out: their composers ignore any
   * prefilled text and build the post from the link's own Open Graph tags, so
   * the caption is copied to the clipboard for pasting — see `needsPaste`.
   */
  intent: (caption: string, url: string) => string;
  needsPaste?: boolean;
  /**
   * Kept in the table but off the tab strip.
   *
   * The four intent-URL networks are hidden rather than deleted: the panel is
   * currently LinkedIn-plus-link, but nothing about them broke, and a removed
   * entry would take its limits, hashtag budget and preview mock with it.
   * Clearing this flag is all it takes to bring one back.
   */
  hidden?: boolean;
};

export const PLATFORMS: Platform[] = [
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: LINKEDIN_ICON,
    limit: 3000,
    hashtagLimit: 30,
    intent: (_c, url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    needsPaste: true,
  },
  {
    id: "link",
    label: "Link",
    icon: LINK_ICON,
    // No composer and no network, so no caption budget applies.
    limit: null,
    hashtagLimit: null,
    // Never called: the panel gives this tab its own body and action.
    intent: (_c, url) => url,
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: siFacebook,
    limit: 63206,
    hashtagLimit: null,
    intent: (_c, url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    needsPaste: true,
    hidden: true,
  },
  {
    id: "twitter",
    label: "X",
    icon: siX,
    limit: 280,
    hashtagLimit: null,
    intent: (c, url) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(c)}&url=${encodeURIComponent(url)}`,
    hidden: true,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: siWhatsapp,
    limit: null,
    hashtagLimit: null,
    intent: (c, url) => `https://wa.me/?text=${encodeURIComponent(`${c}\n\n${url}`)}`,
    hidden: true,
  },
  {
    id: "telegram",
    label: "Telegram",
    icon: siTelegram,
    limit: null,
    hashtagLimit: null,
    intent: (c, url) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(c)}`,
    hidden: true,
  },
];

/** The tabs the panel shows, in order. */
export const VISIBLE_PLATFORMS = PLATFORMS.filter((p) => !p.hidden);

export function PlatformGlyph({ icon, size = 16 }: { icon: { path: string; hex: string }; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={{ display: "block", flexShrink: 0 }} aria-hidden="true">
      <path d={icon.path} />
    </svg>
  );
}

/**
 * Copy synchronously, inside the click that asked for it.
 *
 * `navigator.clipboard.writeText` returns a promise, and awaiting it before
 * opening the share window broke both: the write outlived its user gesture and
 * the popup was blocked. `execCommand("copy")` is deprecated but synchronous,
 * which is the property that matters here — the async API is still fired
 * alongside it for browsers that have dropped the old one.
 */
export function copyText(text: string): boolean {
  try {
    navigator.clipboard?.writeText(text).catch(() => {});
  } catch {
    // Ignored — the synchronous path below is the one being relied on.
  }

  const area = document.createElement("textarea");
  area.value = text;
  // Off-screen rather than hidden: a `display:none` element cannot be selected,
  // and the copy silently does nothing.
  area.style.cssText = "position:fixed;top:-9999px;opacity:0";
  document.body.appendChild(area);
  area.select();

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    area.remove();
  }
}
