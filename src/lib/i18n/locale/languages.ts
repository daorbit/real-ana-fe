export type Language = {
  code: string;
  label: string;
  native: string;
  flag: string;
};

export const DEFAULT_LANGUAGE = "en";

export const LANGUAGES: Language[] = [
  { code: "en", label: "English", native: "English", flag: "us" },
  { code: "es", label: "Spanish", native: "Español", flag: "es" },
  { code: "fr", label: "French", native: "Français", flag: "fr" },
  { code: "de", label: "German", native: "Deutsch", flag: "de" },
  { code: "pt", label: "Portuguese", native: "Português", flag: "pt" },
  { code: "it", label: "Italian", native: "Italiano", flag: "it" },
  { code: "nl", label: "Dutch", native: "Nederlands", flag: "nl" },
  { code: "sv", label: "Swedish", native: "Svenska", flag: "se" },
  { code: "da", label: "Danish", native: "Dansk", flag: "dk" },
  { code: "no", label: "Norwegian", native: "Norsk", flag: "no" },
  { code: "fi", label: "Finnish", native: "Suomi", flag: "fi" },
  { code: "pl", label: "Polish", native: "Polski", flag: "pl" },
  { code: "cs", label: "Czech", native: "Čeština", flag: "cz" },
  { code: "ro", label: "Romanian", native: "Română", flag: "ro" },
  { code: "hu", label: "Hungarian", native: "Magyar", flag: "hu" },
  { code: "el", label: "Greek", native: "Ελληνικά", flag: "gr" },
  { code: "tr", label: "Turkish", native: "Türkçe", flag: "tr" },
  { code: "ru", label: "Russian", native: "Русский", flag: "ru" },
  { code: "uk", label: "Ukrainian", native: "Українська", flag: "ua" },
  { code: "ar", label: "Arabic", native: "العربية", flag: "sa" },
  { code: "iw", label: "Hebrew", native: "עברית", flag: "il" },
  { code: "hi", label: "Hindi", native: "हिन्दी", flag: "in" },
  { code: "bn", label: "Bengali", native: "বাংলা", flag: "bd" },
  { code: "ur", label: "Urdu", native: "اردو", flag: "pk" },
  { code: "id", label: "Indonesian", native: "Bahasa Indonesia", flag: "id" },
  { code: "ms", label: "Malay", native: "Bahasa Melayu", flag: "my" },
  { code: "th", label: "Thai", native: "ไทย", flag: "th" },
  { code: "vi", label: "Vietnamese", native: "Tiếng Việt", flag: "vn" },
  { code: "tl", label: "Filipino", native: "Filipino", flag: "ph" },
  { code: "ja", label: "Japanese", native: "日本語", flag: "jp" },
  { code: "ko", label: "Korean", native: "한국어", flag: "kr" },
  { code: "zh-CN", label: "Chinese (Simplified)", native: "简体中文", flag: "cn" },
  { code: "zh-TW", label: "Chinese (Traditional)", native: "繁體中文", flag: "tw" },
];
