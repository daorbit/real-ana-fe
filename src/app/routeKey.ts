const TABBED_PAGES = ["/app/settings"];

export function routeKey(pathname: string): string {
  return TABBED_PAGES.find((p) => pathname === p || pathname.startsWith(`${p}/`)) ?? pathname;
}
