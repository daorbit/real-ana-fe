import { DEFAULT_LANGUAGE } from "@/lib/i18n/locale/languages";

const COOKIE_NAME = "googtrans";
const ONE_YEAR = 60 * 60 * 24 * 365;

export function readTranslateLanguage(): string {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
  const target = match ? decodeURIComponent(match[1]).split("/").pop() : undefined;
  return target || DEFAULT_LANGUAGE;
}

function cookieDomains() {
  const { hostname } = window.location;
  const rootDomain = hostname.split(".").slice(-2).join(".");
  return ["", `; domain=${hostname}`, `; domain=.${hostname}`, `; domain=.${rootDomain}`];
}

function clearTranslateCookie() {
  cookieDomains().forEach((domain) => {
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0${domain}`;
  });
}

export function setTranslateLanguage(code: string) {
  clearTranslateCookie();
  if (code !== DEFAULT_LANGUAGE) {
    document.cookie = `${COOKIE_NAME}=/${DEFAULT_LANGUAGE}/${code}; path=/; max-age=${ONE_YEAR}; SameSite=Lax`;
  }
  window.location.reload();
}
