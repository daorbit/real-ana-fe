export const WELCOME_PENDING_KEY = "quantalog_welcome_pending";

export function consumeWelcomePending(): boolean {
  try {
    if (localStorage.getItem(WELCOME_PENDING_KEY) !== "1") return false;
    localStorage.removeItem(WELCOME_PENDING_KEY);
    return true;
  } catch {
    return false;
  }
}
