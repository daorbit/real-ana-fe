const SEEN_PREFIX = "qbio:";

export function firstVisitToday(slug: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const key = `${SEEN_PREFIX}${slug}`;
    if (localStorage.getItem(key) === today) return false;
    localStorage.setItem(key, today);
    return true;
  } catch {
    return false;
  }
}

export function referrerHost(referrer: string): string {
  if (!referrer) return "";
  try {
    const host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
    return host === window.location.hostname ? "" : host;
  } catch {
    return "";
  }
}

export function campaignOf(search: string): string {
  return (new URLSearchParams(search).get("utm_campaign") ?? "").toLowerCase().slice(0, 60);
}
