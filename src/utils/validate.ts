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

export function password(v: string): string | null {
  if (!v) return "Password is required";
  if (v.length < 6) return "Password must be at least 6 characters";
  return null;
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
