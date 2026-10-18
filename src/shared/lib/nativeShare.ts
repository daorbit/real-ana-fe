export function canNativeShare(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    (window.matchMedia?.("(pointer: coarse)").matches ?? false)
  );
}

export async function nativeShare(data: { url: string; title?: string; text?: string }): Promise<boolean> {
  try {
    await navigator.share(data);
    return true;
  } catch {
    return false;
  }
}
