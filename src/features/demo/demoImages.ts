const svg = (width: number, height: number, body: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`,
  )}`;

export const DEMO_HERO_IMAGE = svg(
  1440,
  900,
  `<rect width="1440" height="900" fill="#1e2a78"/>
  <rect x="160" y="140" width="1120" height="620" rx="28" fill="#ffffff"/>
  <rect x="160" y="140" width="1120" height="72" rx="28" fill="#eef0fb"/>
  <circle cx="210" cy="176" r="10" fill="#f87171"/><circle cx="244" cy="176" r="10" fill="#fbbf24"/><circle cx="278" cy="176" r="10" fill="#34d399"/>
  <rect x="220" y="270" width="420" height="40" rx="10" fill="#1e2a78"/>
  <rect x="220" y="330" width="560" height="22" rx="8" fill="#c7cbe8"/>
  <rect x="220" y="370" width="480" height="22" rx="8" fill="#c7cbe8"/>
  <rect x="220" y="440" width="200" height="56" rx="12" fill="#4f46e5"/>
  <rect x="860" y="270" width="360" height="420" rx="20" fill="#eef0fb"/>
  <rect x="900" y="560" width="50" height="100" rx="8" fill="#818cf8"/>
  <rect x="970" y="500" width="50" height="160" rx="8" fill="#6366f1"/>
  <rect x="1040" y="430" width="50" height="230" rx="8" fill="#4f46e5"/>
  <rect x="1110" y="360" width="50" height="300" rx="8" fill="#4338ca"/>`,
);

export const DEMO_LOGO_IMAGE = svg(
  240,
  64,
  `<rect width="240" height="64" rx="14" fill="#ffffff"/>
  <rect x="14" y="12" width="40" height="40" rx="10" fill="#4f46e5"/>
  <path d="M26 42 L34 22 L42 42 Z" fill="#ffffff"/>
  <text x="66" y="42" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#111827">Acme</text>`,
);

export const DEMO_CHART_IMAGE = svg(
  800,
  420,
  `<rect width="800" height="420" fill="#ffffff"/>
  <text x="48" y="64" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#111827">Pricing</text>
  <rect x="48" y="104" width="216" height="268" rx="18" fill="#f3f4f6"/>
  <rect x="292" y="84" width="216" height="288" rx="18" fill="#4f46e5"/>
  <rect x="536" y="104" width="216" height="268" rx="18" fill="#f3f4f6"/>
  <rect x="76" y="140" width="120" height="18" rx="6" fill="#9ca3af"/>
  <rect x="320" y="120" width="120" height="18" rx="6" fill="#c7d2fe"/>
  <rect x="564" y="140" width="120" height="18" rx="6" fill="#9ca3af"/>
  <text x="76" y="220" font-family="Arial, sans-serif" font-size="40" font-weight="700" fill="#16a34a">$0</text>
  <text x="320" y="200" font-family="Arial, sans-serif" font-size="40" font-weight="700" fill="#ffffff">$19</text>
  <text x="564" y="220" font-family="Arial, sans-serif" font-size="40" font-weight="700" fill="#16a34a">$49</text>`,
);
