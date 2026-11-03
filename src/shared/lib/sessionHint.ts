export type SessionHint = { id: string; demo: boolean; impersonating: boolean };

const KEY = "rta_session";

function read(): SessionHint | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SessionHint) : null;
  } catch {
    return null;
  }
}

export function rememberSession(hint: SessionHint | undefined) {
  if (!hint) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(hint));
  } catch {
    return;
  }
}

export function forgetSession() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    return;
  }
}

export function hasSession(): boolean {
  return read() !== null;
}

export function isDemoSession(): boolean {
  return read()?.demo === true;
}

export function isImpersonating(): boolean {
  return read()?.impersonating === true;
}

export function sessionId(): string {
  return read()?.id ?? "";
}
