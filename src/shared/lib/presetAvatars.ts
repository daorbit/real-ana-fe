/**
 * Preset profile pictures offered instead of an upload.
 *
 * Generated identicons, bundled locally rather than hot-linked — the picker
 * needs to render instantly and work offline, and a signup that's blocked
 * on a third party for its default avatar is one more thing that can fail.
 */
export const PRESET_AVATARS = [
  "bottts_riley", "bottts_cameron", "bottts_sage",
  "bottts_drew", "bottts_lucas", "bottts_reese",
  "pixelart_jamie", "pixelart_cameron", "pixelart_casey",
  "notionists_riley", "notionists_casey", "notionists_quinn", "notionists_mia",
].map((id) => `/avatars/presets/${id}.svg`);

export function randomPresetAvatar(): string {
  return PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
}

/** Turns a preset's URL into the same kind of Blob a file upload would give
 *  uploadAvatar, so picking one goes through the exact same save path. */
export async function fetchPresetAvatarBlob(src: string): Promise<Blob> {
  const res = await fetch(src);
  if (!res.ok) throw new Error("Could not load that avatar.");
  return res.blob();
}
