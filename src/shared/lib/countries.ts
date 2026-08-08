// ISO-3166-1 alpha-2 -> display name.
// Names match the world-atlas topojson `properties.name` values so the map can
// colour the right shape. Only the codes Vercel's edge actually emits matter.
const NAMES: Record<string, string> = {
  AE: "United Arab Emirates", AR: "Argentina", AT: "Austria", AU: "Australia",
  BD: "Bangladesh", BE: "Belgium", BG: "Bulgaria", BR: "Brazil",
  CA: "Canada", CH: "Switzerland", CL: "Chile", CN: "China", CO: "Colombia",
  CZ: "Czechia", DE: "Germany", DK: "Denmark", EG: "Egypt", ES: "Spain",
  FI: "Finland", FR: "France", GB: "United Kingdom", GR: "Greece",
  HK: "Hong Kong", HR: "Croatia", HU: "Hungary", ID: "Indonesia",
  IE: "Ireland", IL: "Israel", IN: "India", IQ: "Iraq", IR: "Iran",
  IT: "Italy", JP: "Japan", KE: "Kenya", KR: "South Korea", LK: "Sri Lanka",
  MA: "Morocco", MX: "Mexico", MY: "Malaysia", NG: "Nigeria",
  NL: "Netherlands", NO: "Norway", NP: "Nepal", NZ: "New Zealand",
  PE: "Peru", PH: "Philippines", PK: "Pakistan", PL: "Poland",
  PT: "Portugal", RO: "Romania", RS: "Serbia", RU: "Russia",
  SA: "Saudi Arabia", SE: "Sweden", SG: "Singapore", TH: "Thailand",
  TR: "Turkey", TW: "Taiwan", UA: "Ukraine", US: "United States of America",
  VN: "Vietnam", ZA: "South Africa",
};

export function countryName(code: string): string | null {
  if (!code || code === "unknown") return null;
  return NAMES[code.toUpperCase()] ?? null;
}

/** Turn an ISO-2 code into its flag emoji via regional indicator symbols. */
export function countryFlag(code: string): string {
  if (!code || code.length !== 2 || code === "unknown") return "🌐";
  const A = 0x1f1e6;
  const up = code.toUpperCase();
  return String.fromCodePoint(
    A + (up.charCodeAt(0) - 65),
    A + (up.charCodeAt(1) - 65)
  );
}

/** Human label for a country bucket key. */
export function countryLabel(code: string): string {
  if (!code || code === "unknown") return "Unknown";
  return NAMES[code.toUpperCase()] ?? code.toUpperCase();
}
