/** Form validators. Each returns an error message, or null when valid. */

export function required(label: string) {
  return (v: string): string | null =>
    v.trim() ? null : `${label} is required`;
}

export function minLength(label: string, n: number) {
  return (v: string): string | null =>
    v.trim().length >= n ? null : `${label} must be at least ${n} characters`;
}

export function maxLength(label: string, n: number) {
  return (v: string): string | null =>
    v.trim().length <= n ? null : `${label} must be ${n} characters or fewer`;
}

export function email(v: string): string | null {
  const s = v.trim();
  if (!s) return "Email is required";
  // Deliberately permissive: the only authority on a valid address is a delivered email.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) return "Enter a valid email address";
  return null;
}

/**
 * Password rules for a NEW password. Kept in step with `signupError` in the
 * API's auth route — the server is the copy that counts, this one exists so
 * the user finds out before submitting.
 *
 * Not applied at login: existing accounts predate these rules, and rejecting
 * someone's working password at the door would lock them out.
 */
export function password(v: string): string | null {
  if (!v) return "Password is required";
  if (v.length < 8) return "Password must be at least 8 characters";
  // bcrypt truncates at 72 bytes, so anything longer is a false sense of
  // strength rather than extra security.
  if (v.length > 72) return "Password must be 72 characters or fewer";
  if (!/[a-zA-Z]/.test(v)) return "Password must contain a letter";
  if (!/[0-9]/.test(v)) return "Password must contain a number";
  return null;
}

/** Score 0–4, for the strength meter. Length first, then variety. */
export function passwordScore(v: string): number {
  if (!v) return 0;
  let score = 0;
  if (v.length >= 8) score++;
  if (v.length >= 12) score++;
  if (/[a-zA-Z]/.test(v) && /[0-9]/.test(v)) score++;
  if (/[^a-zA-Z0-9]/.test(v)) score++;
  return Math.min(score, 4);
}

/** Confirmation must match exactly — whitespace included. */
export function confirmPassword(pw: string) {
  return (v: string): string | null => {
    if (!v) return "Please re-enter your password";
    if (v !== pw) return "Passwords do not match";
    return null;
  };
}

/**
 * A trackable domain: a bare hostname, no scheme, no path.
 * We accept what the user pastes and let `normalizeDomain` clean it first.
 */
export function domain(v: string): string | null {
  const s = normalizeDomain(v);
  if (!s) return "Domain is required";
  if (s.includes(" ")) return "A domain cannot contain spaces";
  if (s === "localhost" || /^\d{1,3}(\.\d{1,3}){3}$/.test(s)) {
    return null; // localhost and raw IPs are fine for testing
  }
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(s)) {
    return "Enter a domain like example.com";
  }
  if (s.length > 253) return "That domain is too long";
  return null;
}

/** Strip scheme, www., path, query and trailing dots — "https://www.a.com/x" -> "a.com". */
export function normalizeDomain(v: string): string {
  return v
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[/?#].*$/, "")
    .replace(/\.$/, "");
}

/** Run several validators, returning the first error. */
export function all(...checks: ((v: string) => string | null)[]) {
  return (v: string): string | null => {
    for (const c of checks) {
      const err = c(v);
      if (err) return err;
    }
    return null;
  };
}
