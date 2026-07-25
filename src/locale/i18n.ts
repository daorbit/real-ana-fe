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

import { LANG_KEY, readLanguage, resolveLanguage } from "./languages";

import en from "./dicts/en.json";
import es from "./dicts/es.json";
import hi from "./dicts/hi.json";
import ja from "./dicts/ja.json";
import fr from "./dicts/fr.json";
import de from "./dicts/de.json";
import pt from "./dicts/pt.json";
import zh from "./dicts/zh.json";
import ar from "./dicts/ar.json";
import ru from "./dicts/ru.json";
import id from "./dicts/id.json";

const resources = {
  en: { translation: en },
  es: { translation: es },
  hi: { translation: hi },
  ja: { translation: ja },
  fr: { translation: fr },
  de: { translation: de },
  pt: { translation: pt },
  zh: { translation: zh },
  ar: { translation: ar },
  ru: { translation: ru },
  id: { translation: id },
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
