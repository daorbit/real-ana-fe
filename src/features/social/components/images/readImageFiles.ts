import { notify } from "@/shared/lib/notify";
import { MAX_IMAGE_MB, MAX_IMAGES, readAsDataUrl } from "../draft";

const ACCEPTED = /^image\/(png|jpeg|webp)$/;

export const ACCEPT_ATTR = "image/png,image/jpeg,image/webp";

/**
 * Turn picked files into data URLs, refusing what cannot be published.
 *
 * Rejections are reported per reason rather than per file: dropping twelve
 * images, three of them oversized, should say so once instead of raising three
 * identical toasts.
 */
export async function readImageFiles(
  files: File[],
  room: number,
  /** The post's ceiling, for the message when there is no room left. */
  max: number = MAX_IMAGES,
): Promise<string[]> {
  if (room <= 0) {
    notify.error(
      max === 1
        ? "This post carries one image. Remove it to choose another."
        : `A post can carry at most ${max} images.`,
    );
    return [];
  }

  const wrongType = files.filter((f) => !ACCEPTED.test(f.type));
  const tooBig = files.filter((f) => ACCEPTED.test(f.type) && f.size > MAX_IMAGE_MB * 1024 * 1024);
  const usable = files.filter((f) => ACCEPTED.test(f.type) && f.size <= MAX_IMAGE_MB * 1024 * 1024);

  if (wrongType.length) notify.error("Images must be PNG, JPEG or WebP.");
  if (tooBig.length) notify.error(`Each image must be ${MAX_IMAGE_MB}MB or smaller.`);

  const taken = usable.slice(0, room);
  if (usable.length > room) {
    notify.error(`Only ${room} more image${room === 1 ? "" : "s"} fit on this post.`);
  }

  const out: string[] = [];
  for (const file of taken) {
    try {
      out.push(await readAsDataUrl(file));
    } catch {
      notify.error(`Could not read ${file.name}.`);
    }
  }
  return out;
}
