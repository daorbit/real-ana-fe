// Inline SVG brand assets — self-contained, no external images (survive strict CSP).

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="Pulse">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32">
          <stop stopColor="#818cf8" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#lg)" />
      <path
        d="M7 17.5h4l2.5-6 3.5 11 2.5-8 1.8 3H25"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function Wordmark() {
  return (
    <div className="wordmark">
      <Logo />
      <span>Pulse</span>
    </div>
  );
}

// Animated hero: a live dashboard mockup rendered entirely in SVG.
export function HeroMock() {
  return (
    <svg viewBox="0 0 520 360" className="hero-mock" role="img" aria-label="Analytics dashboard preview">
      <defs>
        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6366f1" stopOpacity="0.55" />
          <stop offset="1" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#1e2130" />
          <stop offset="1" stopColor="#171a26" />
        </linearGradient>
      </defs>

      {/* window */}
      <rect x="0" y="0" width="520" height="360" rx="16" fill="url(#card)" stroke="#2a2e3a" />
      <circle cx="22" cy="22" r="4" fill="#ef4444" />
      <circle cx="38" cy="22" r="4" fill="#f59e0b" />
      <circle cx="54" cy="22" r="4" fill="#22c55e" />
      <line x1="0" y1="44" x2="520" y2="44" stroke="#2a2e3a" />

      {/* KPI tiles */}
      {[
        { x: 20, label: "Visitors", val: "12.8k" },
        { x: 190, label: "Pageviews", val: "48.2k" },
        { x: 360, label: "Live", val: "326", live: true },
      ].map((k) => (
        <g key={k.label} transform={`translate(${k.x},64)`}>
          <rect width="140" height="64" rx="10" fill="#12151f" stroke="#2a2e3a" />
          <text x="14" y="30" fill={k.live ? "#22c55e" : "#e6e8ee"} fontSize="22" fontWeight="700">{k.val}</text>
          <text x="14" y="50" fill="#8b90a0" fontSize="11">{k.label}</text>
          {k.live && <circle cx="118" cy="20" r="4" fill="#22c55e" className="pulse-dot" />}
        </g>
      ))}

      {/* area chart */}
      <g transform="translate(20,148)">
        <rect width="480" height="130" rx="10" fill="#12151f" stroke="#2a2e3a" />
        <path
          className="hero-area"
          d="M20 105 L70 80 L120 90 L170 55 L220 70 L270 35 L320 50 L370 25 L420 45 L460 20 L460 118 L20 118 Z"
          fill="url(#area)"
        />
        <path
          className="hero-line"
          d="M20 105 L70 80 L120 90 L170 55 L220 70 L270 35 L320 50 L370 25 L420 45 L460 20"
          fill="none"
          stroke="#818cf8"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>

      {/* bar list */}
      <g transform="translate(20,290)">
        {[70, 55, 40, 28].map((w, i) => (
          <g key={i} transform={`translate(0,${i * 16})`}>
            <rect width={w * 4} height="10" rx="3" fill="#6366f1" opacity={0.85 - i * 0.15} />
          </g>
        ))}
      </g>
    </svg>
  );
}

// Small framework glyphs for the site cards
export function FrameworkIcon({ name }: { name: string }) {
  const map: Record<string, string> = {
    react: "#61dafb",
    vue: "#42b883",
    angular: "#dd0031",
    svelte: "#ff3e00",
    other: "#8b90a0",
  };
  return <span className="fw-dot" style={{ background: map[name] ?? map.other }} />;
}
