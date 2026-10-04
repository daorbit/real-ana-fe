/**
 * i18next setup.
 *
 * The language preference is client-only — kept in localStorage under LANG_KEY,
 * never sent to the server — and defaults to the browser's language when unset.
 * English is the fallback for any key a translation hasn't filled in yet, so a
 * partially translated screen degrades to English rather than showing raw keys.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { LANG_KEY, readLanguage, resolveLanguage } from "@/lib/i18n/locale/languages";

import en from "@/lib/i18n/locale/dicts/en.json";
import es from "@/lib/i18n/locale/dicts/es.json";
import hi from "@/lib/i18n/locale/dicts/hi.json";
import ja from "@/lib/i18n/locale/dicts/ja.json";

const resources = {
  en: { translation: en },
  es: { translation: es },
  hi: { translation: hi },
  ja: { translation: ja },
} as const;

i18n.use(initReactI18next).init({
  resources,
  // The stored preference may be "" (follow browser) or an unshipped tag;
  // resolveLanguage collapses both to a real dictionary, English at worst.
  lng: resolveLanguage(readLanguage()),
  fallbackLng: "en",
  interpolation: { escapeValue: false }, // React already escapes.
  returnNull: false,
});

/** Re-export so callers touch one localStorage key name, defined once. */
export { LANG_KEY };
export default i18n;
