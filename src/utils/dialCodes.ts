/**
 * Country dialling codes for the phone input.
 *
 * Separate from `countries.ts` because that list exists to colour the analytics
 * map and only holds the codes Vercel's edge emits — a visitor list, not a
 * signup list. Someone registering from a country we've never had traffic from
 * still needs to be able to pick it.
 *
 * `name` is used for search, so the spellings people actually type are what
 * matter here, not the topojson names the map has to match.
 */
export type DialCode = {
  /** ISO-3166-1 alpha-2, and the flag's source. */
  iso: string;
  name: string;
  /** Without the leading "+". */
  dial: string;
};

export const DIAL_CODES: DialCode[] = [
  { iso: "IN", name: "India", dial: "91" },
  { iso: "US", name: "United States", dial: "1" },
  { iso: "GB", name: "United Kingdom", dial: "44" },
  { iso: "AE", name: "United Arab Emirates", dial: "971" },
  { iso: "AU", name: "Australia", dial: "61" },
  { iso: "CA", name: "Canada", dial: "1" },
  { iso: "SG", name: "Singapore", dial: "65" },
  { iso: "DE", name: "Germany", dial: "49" },
  { iso: "FR", name: "France", dial: "33" },
  { iso: "NL", name: "Netherlands", dial: "31" },
  { iso: "ES", name: "Spain", dial: "34" },
  { iso: "IT", name: "Italy", dial: "39" },
  { iso: "IE", name: "Ireland", dial: "353" },
  { iso: "PT", name: "Portugal", dial: "351" },
  { iso: "BE", name: "Belgium", dial: "32" },
  { iso: "CH", name: "Switzerland", dial: "41" },
  { iso: "AT", name: "Austria", dial: "43" },
  { iso: "SE", name: "Sweden", dial: "46" },
  { iso: "NO", name: "Norway", dial: "47" },
  { iso: "DK", name: "Denmark", dial: "45" },
  { iso: "FI", name: "Finland", dial: "358" },
  { iso: "PL", name: "Poland", dial: "48" },
  { iso: "CZ", name: "Czechia", dial: "420" },
  { iso: "RO", name: "Romania", dial: "40" },
  { iso: "GR", name: "Greece", dial: "30" },
  { iso: "TR", name: "Turkey", dial: "90" },
  { iso: "UA", name: "Ukraine", dial: "380" },
  { iso: "RU", name: "Russia", dial: "7" },
  { iso: "IL", name: "Israel", dial: "972" },
  { iso: "SA", name: "Saudi Arabia", dial: "966" },
  { iso: "QA", name: "Qatar", dial: "974" },
  { iso: "KW", name: "Kuwait", dial: "965" },
  { iso: "BH", name: "Bahrain", dial: "973" },
  { iso: "OM", name: "Oman", dial: "968" },
  { iso: "EG", name: "Egypt", dial: "20" },
  { iso: "ZA", name: "South Africa", dial: "27" },
  { iso: "NG", name: "Nigeria", dial: "234" },
  { iso: "KE", name: "Kenya", dial: "254" },
  { iso: "GH", name: "Ghana", dial: "233" },
  { iso: "MA", name: "Morocco", dial: "212" },
  { iso: "PK", name: "Pakistan", dial: "92" },
  { iso: "BD", name: "Bangladesh", dial: "880" },
  { iso: "LK", name: "Sri Lanka", dial: "94" },
  { iso: "NP", name: "Nepal", dial: "977" },
  { iso: "CN", name: "China", dial: "86" },
  { iso: "HK", name: "Hong Kong", dial: "852" },
  { iso: "TW", name: "Taiwan", dial: "886" },
  { iso: "JP", name: "Japan", dial: "81" },
  { iso: "KR", name: "South Korea", dial: "82" },
  { iso: "MY", name: "Malaysia", dial: "60" },
  { iso: "ID", name: "Indonesia", dial: "62" },
  { iso: "TH", name: "Thailand", dial: "66" },
  { iso: "VN", name: "Vietnam", dial: "84" },
  { iso: "PH", name: "Philippines", dial: "63" },
  { iso: "NZ", name: "New Zealand", dial: "64" },
  { iso: "BR", name: "Brazil", dial: "55" },
  { iso: "MX", name: "Mexico", dial: "52" },
  { iso: "AR", name: "Argentina", dial: "54" },
  { iso: "CL", name: "Chile", dial: "56" },
  { iso: "CO", name: "Colombia", dial: "57" },
  { iso: "PE", name: "Peru", dial: "51" },
];

/** The default selection, guessed from the browser rather than assumed. */
export function guessCountry(): DialCode {
  const fallback = DIAL_CODES[0];
  try {
    // "en-IN" / "en-GB" — the region subtag is the only part that helps here.
    const region = new Intl.Locale(navigator.language).region;
    if (region) {
      const hit = DIAL_CODES.find((c) => c.iso === region.toUpperCase());
      if (hit) return hit;
    }
  } catch {
    // Old browser, or a language tag Intl.Locale won't parse — the default is
    // a fine answer, and the user can change it.
  }
  return fallback;
}

/**
 * Split a stored E.164-ish number back into a country and a local part.
 *
 * Longest dial code first, so "+1..." can't win over "+91..." — the shorter
 * code is a prefix of the longer one and would match first otherwise.
 */
export function splitNumber(stored: string): { country: DialCode; local: string } {
  const digits = (stored ?? "").replace(/[^\d]/g, "");
  if (digits) {
    const byLength = DIAL_CODES.slice().sort((a, b) => b.dial.length - a.dial.length);
    for (const c of byLength) {
      if (digits.startsWith(c.dial)) {
        return { country: c, local: digits.slice(c.dial.length) };
      }
    }
  }
  return { country: guessCountry(), local: digits };
}
