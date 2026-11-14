import { notify } from "@/shared/lib/notify";

export async function copyText(text: string, success = "Link copied."): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    notify.success(success);
  } catch {
    notify.error("Could not copy the link.");
  }
}
