const APP_LOGO_VERSION = "5";

export function appLogoUrl(file: string): string {
  return `/apps/${file}?v=${APP_LOGO_VERSION}`;
}
