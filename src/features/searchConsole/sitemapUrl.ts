export function sitemapBase(propertyUrl: string): string {
  if (/^sc-domain:/i.test(propertyUrl)) return `https://${propertyUrl.replace(/^sc-domain:/i, "")}/`;
  return propertyUrl.endsWith("/") ? propertyUrl : `${propertyUrl}/`;
}

export function resolveSitemapUrl(base: string, input: string): string {
  const value = input.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return base + value.replace(/^\/+/, "");
}

export function sitemapPath(url: string): string {
  return url.replace(/^https?:\/\/[^/]+/, "") || url;
}
