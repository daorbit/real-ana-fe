import { DEFAULT_LANGUAGE, LANGUAGES } from "@/lib/i18n/locale/languages";
import { readTranslateLanguage } from "@/lib/i18n/locale/googtrans";
import { patchDomForTranslate } from "@/lib/i18n/locale/patchDom";

const ELEMENT_ID = "google_translate_element";
const SCRIPT_ID = "google-translate-script";
const SCRIPT_SRC = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";

type TranslateElementOptions = {
  pageLanguage: string;
  includedLanguages: string;
  autoDisplay: boolean;
};

type TranslateWindow = Window & {
  google?: {
    translate?: {
      TranslateElement: new (options: TranslateElementOptions, elementId: string) => unknown;
    };
  };
  googleTranslateElementInit?: () => void;
};

export function startGoogleTranslate() {
  if (readTranslateLanguage() === DEFAULT_LANGUAGE || document.getElementById(SCRIPT_ID)) return;

  patchDomForTranslate();

  const host = document.createElement("div");
  host.id = ELEMENT_ID;
  host.hidden = true;
  host.setAttribute("aria-hidden", "true");
  document.body.appendChild(host);

  const win = window as TranslateWindow;
  win.googleTranslateElementInit = () => {
    const TranslateElement = win.google?.translate?.TranslateElement;
    if (!TranslateElement) return;
    new TranslateElement(
      {
        pageLanguage: DEFAULT_LANGUAGE,
        includedLanguages: LANGUAGES.map((language) => language.code).join(","),
        autoDisplay: false,
      },
      ELEMENT_ID,
    );
  };

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = SCRIPT_SRC;
  script.async = true;
  document.body.appendChild(script);
}
