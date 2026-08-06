/**
 * Form validators. Each returns an error message, or null when valid.
 *
 * Messages resolve through i18n at call time rather than being built by string
 * concatenation, so they follow the chosen language. The signatures are
 * unchanged — a `label` passed in is interpolated into the message, so callers
 * should hand these an already-translated field name.
 *
 * i18n is imported directly rather than taking a `t` parameter because these
 * are called from event handlers and module scope as often as from components,
 * where no hook is available.
 */
import i18n from "../locale/i18n";

export function required(label: string) {
  return (v: string): string | null =>
    v.trim() ? null : i18n.t("validate.required", { label });
}

export function minLength(label: string, n: number) {
  return (v: string): string | null =>
    // `n`, not `count` — `count` would make i18next look for plural variants
    // of the key that don't exist.
    v.trim().length >= n ? null : i18n.t("validate.minLength", { label, n });
}

export function maxLength(label: string, n: number) {
  return (v: string): string | null =>
    v.trim().length <= n ? null : i18n.t("validate.maxLength", { label, n });
}

export function email(v: string): string | null {
  const s = v.trim();
  if (!s) return i18n.t("validate.emailRequired");
  // Deliberately permissive: the only authority on a valid address is a delivered email.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) return i18n.t("validate.emailInvalid");
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
  if (!v) return i18n.t("validate.passwordRequired");
  if (v.length < 8) return i18n.t("validate.passwordMin");
  // bcrypt truncates at 72 bytes, so anything longer is a false sense of
  // strength rather than extra security.
  if (v.length > 72) return i18n.t("validate.passwordMax");
  if (!/[a-zA-Z]/.test(v)) return i18n.t("validate.passwordLetter");
  if (!/[0-9]/.test(v)) return i18n.t("validate.passwordNumber");
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
    if (!v) return i18n.t("validate.passwordReenter");
    if (v !== pw) return i18n.t("validate.passwordMismatch");
    return null;
  };
}

/**
 * A trackable domain: a bare hostname, no scheme, no path.
 * We accept what the user pastes and let `normalizeDomain` clean it first.
 */
export function domain(v: string): string | null {
  const s = normalizeDomain(v);
  if (!s) return i18n.t("validate.domainRequired");
  if (s.includes(" ")) return i18n.t("validate.domainSpaces");
  if (s === "localhost" || /^\d{1,3}(\.\d{1,3}){3}$/.test(s)) {
    return null; // localhost and raw IPs are fine for testing
  }
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(s)) {
    return i18n.t("validate.domainInvalid");
  }
  if (s.length > 253) return i18n.t("validate.domainTooLong");
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
