export const ACTIVE_WORKSPACE_KEY = "rta_active_ws";
const LAST_WORKSPACE_KEY = "rta_last_ws";

export function readStoredWorkspace(): string | null {
  try {
    return localStorage.getItem(ACTIVE_WORKSPACE_KEY);
  } catch {
    return null;
  }
}

export function readLastWorkspace(): string | null {
  try {
    return localStorage.getItem(LAST_WORKSPACE_KEY);
  } catch {
    return null;
  }
}

export function writeStoredWorkspace(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_WORKSPACE_KEY, id);
      localStorage.setItem(LAST_WORKSPACE_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
    }
  } catch {
    return;
  }
}
