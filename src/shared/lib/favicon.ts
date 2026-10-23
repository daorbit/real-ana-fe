export function faviconForHost(host: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
}

export function faviconForUrl(url: string): string | null {
  try {
    return faviconForHost(new URL(url).hostname);
  } catch {
    return null;
  }
}
