/**
 * Reading and switching the interface language from React.
 *
 * The language is a client-only preference (localStorage, never the server).
 * Switching it does three things in step: persist the choice, tell i18next to
 * re-render every `t()` call, and flip the document's `lang`/`dir` so screen
 * readers and RTL layout follow. `applyDocumentLang` is exported so the app can
 * set the correct direction on first paint, before any component mounts.
 */
import { useCallback, useSyncExternalStore } from "react";

import i18n from "@/lib/i18n/locale/i18n";
import {
  isRtl,
  resolveLanguage,
  writeLanguage,
  readLanguage,
} from "@/lib/i18n/locale/languages";

/** Set <html lang> and <html dir> for a resolved base tag. */
export function applyDocumentLang(tag: string): void {
  const resolved = resolveLanguage(tag);
  const el = document.documentElement;
  el.lang = resolved;
  el.dir = isRtl(resolved) ? "rtl" : "ltr";
}

/**
 * Current language + a setter. `pref` is the raw stored preference ("" means
 * follow the browser); `lang` is what that resolves to and actually renders.
 */
export function useLang() {
  // Re-render this component whenever i18next changes language.
  const lang = useSyncExternalStore(
    (cb) => {
      i18n.on("languageChanged", cb);
      return () => i18n.off("languageChanged", cb);
    },
    () => i18n.language,
    () => i18n.language,
  );

  const setLang = useCallback((pref: string) => {
    writeLanguage(pref);
    const resolved = resolveLanguage(pref);
    applyDocumentLang(resolved);
    void i18n.changeLanguage(resolved);
  }, []);

  return { lang, pref: readLanguage(), setLang };
}
