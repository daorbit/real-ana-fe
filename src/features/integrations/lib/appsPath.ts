export const APPS_PATH = "/app/apps";

export function appsPath(app?: string): string {
  return app ? `${APPS_PATH}?app=${encodeURIComponent(app)}` : APPS_PATH;
}
