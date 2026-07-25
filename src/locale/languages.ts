/**
 * Interface-language catalogue and the client-side preference behind it.
 *
 * The dashboard is English-only for now, so the chosen language is a stored
 * preference — kept in localStorage on this device — that a future translation
 * layer will read, not a live switch. Keeping the list, the storage key, and
 * the name/detection helpers in one module means the Settings picker and any
 * later consumer share exactly one source of truth.
 */

export type Language = {
  /** BCP 47 base tag, or "" for "follow the browser". */
  value: string;
  /** What the option reads as in the picker: native name, English in parens. */
  label: string;
  /** Native name alone, for compact display elsewhere. */
  native: string;
};

/**
 * Languages the picker offers. Native name first so a speaker can find their
 * own language without reading English; English name in parens for everyone
 * else. Ordered most-spoken-ish, English pinned to the top after the default.
 */
export const LANGUAGES: Language[] = [
  { value: "", label: "Match my browser", native: "" },
  { value: "en", label: "English", native: "English" },
  { value: "es", label: "Español (Spanish)", native: "Español" },
  { value: "hi", label: "हिन्दी (Hindi)", native: "हिन्दी" },
  { value: "ja", label: "日本語 (Japanese)", native: "日本語" },
  { value: "fr", label: "Français (French)", native: "Français" },
  { value: "de", label: "Deutsch (German)", native: "Deutsch" },
  { value: "pt", label: "Português (Portuguese)", native: "Português" },
  { value: "zh", label: "中文 (Chinese)", native: "中文" },
  { value: "ar", label: "العربية (Arabic)", native: "العربية" },
  { value: "ru", label: "Русский (Russian)", native: "Русский" },
  { value: "id", label: "Bahasa Indonesia (Indonesian)", native: "Bahasa Indonesia" },
];

/** localStorage key for the saved interface-language preference. */
export const LANG_KEY = "quantalog_language";

/**
 * Human name for a BCP 47 tag — the native name from our own list when we know
 * it, otherwise whatever `Intl.DisplayNames` can render, falling back to the
 * raw tag. Used to show what "Match my browser" resolves to.
 */
export function languageName(tag: string): string {
  const base = tag.split("-")[0].toLowerCase();
  const hit = LANGUAGES.find((l) => l.value === base);
  if (hit) return hit.native || hit.label;
  try {
    return new Intl.DisplayNames([tag], { type: "language" }).of(base) ?? tag;
  } catch {
    return tag;
  }
}

/** The browser's own language tag, resolved once. Null if unavailable. */
export const BROWSER_LANG: string | null = (() => {
  try {
    return navigator.language || null;
  } catch {
    return null;
  }
})();

/** Read the saved language preference; "" (follow browser) on any failure. */
export function readLanguage(): string {
  try {
    return localStorage.getItem(LANG_KEY) ?? "";
  } catch {
    return "";
  }
}

/**
 * Persist the language preference. An empty value clears it (back to "follow
 * the browser"). Returns false if storage was unavailable — the caller decides
 * whether that's worth surfacing.
 */
export function writeLanguage(value: string): boolean {
  try {
    if (value) localStorage.setItem(LANG_KEY, value);
    else localStorage.removeItem(LANG_KEY);
    return true;
  } catch {
    return false;
  }
}

/** Base tags we actually ship a dictionary for. "en" is always the fallback. */
export const SUPPORTED = LANGUAGES.map((l) => l.value).filter(Boolean);

/** Languages written right-to-left — the document `dir` flips for these. */
export const RTL = new Set(["ar", "he", "fa", "ur"]);

/**
 * Turn a stored preference into a base tag we can actually render.
 *
 * "" (follow the browser) resolves against `navigator.language`; anything we
 * don't ship falls back to English, so a half-known tag never leaves the UI
 * blank. The result is always one of SUPPORTED.
 */
export function resolveLanguage(pref: string): string {
  const pick = (tag: string | null | undefined) => {
    const base = (tag ?? "").split("-")[0].toLowerCase();
    return SUPPORTED.includes(base) ? base : "";
  };
  return pick(pref) || pick(BROWSER_LANG) || "en";
}

/** Whether a base tag is right-to-left. */
export function isRtl(tag: string): boolean {
  return RTL.has(tag.split("-")[0].toLowerCase());
}
