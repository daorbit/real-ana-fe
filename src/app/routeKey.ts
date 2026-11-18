const TABBED_PAGES = ["/app/settings", "/app/admin-tools", "/app/seo"];

export function routeKey(pathname: string): string {
  return TABBED_PAGES.find((p) => pathname === p || pathname.startsWith(`${p}/`)) ?? pathname;
}
