// Inline SVG brand assets — self-contained, no external images (survive strict CSP).

export function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="Pulse">
      <rect width="32" height="32" rx="8" fill="#4f46e5" />
      <path
        d="M7 17.5h4l2.5-6 3.5 11 2.5-8 1.8 3H25"
        stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"
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

// Light dashboard mockup rendered entirely in SVG.
export function HeroMock() {
  return (
    <svg viewBox="0 0 520 340" className="hero-mock" role="img" aria-label="Analytics dashboard preview">
      <defs>
        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4f46e5" stopOpacity="0.35" />
          <stop offset="1" stopColor="#4f46e5" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="520" height="340" rx="14" fill="#ffffff" stroke="#e4e7ec" />
      <circle cx="22" cy="22" r="4" fill="#f97066" />
      <circle cx="38" cy="22" r="4" fill="#fdb022" />
      <circle cx="54" cy="22" r="4" fill="#32d583" />
      <line x1="0" y1="44" x2="520" y2="44" stroke="#e4e7ec" />

      {[
        { x: 20, label: "Visitors", val: "12.8k" },
        { x: 190, label: "Pageviews", val: "48.2k" },
        { x: 360, label: "Live", val: "326", live: true },
      ].map((k) => (
        <g key={k.label} transform={`translate(${k.x},62)`}>
          <rect width="140" height="60" rx="9" fill="#f9fafb" stroke="#e4e7ec" />
          <text x="14" y="28" fill={k.live ? "#12b76a" : "#111827"} fontSize="21" fontWeight="700">{k.val}</text>
          <text x="14" y="47" fill="#98a2b3" fontSize="11">{k.label}</text>
          {k.live && <circle cx="118" cy="18" r="4" fill="#12b76a" className="pulse-dot" />}
        </g>
      ))}

      <g transform="translate(20,142)">
        <rect width="480" height="120" rx="9" fill="#f9fafb" stroke="#e4e7ec" />
        <path className="hero-area" d="M20 95 L70 72 L120 82 L170 50 L220 64 L270 32 L320 46 L370 24 L420 42 L460 20 L460 108 L20 108 Z" fill="url(#area)" />
        <path className="hero-line" d="M20 95 L70 72 L120 82 L170 50 L220 64 L270 32 L320 46 L370 24 L420 42 L460 20" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      <g transform="translate(20,278)">
        {[70, 55, 40, 28].map((w, i) => (
          <rect key={i} y={i * 15} width={w * 4} height="9" rx="3" fill="#4f46e5" opacity={0.7 - i * 0.13} />
        ))}
      </g>
    </svg>
  );
}

// Branded left panel shared by login + signup.
export function AuthSide() {
  return (
    <div className="auth-side">
      <div className="auth-side-inner">
        <Wordmark />
        <h2>Real-time analytics for every app you ship.</h2>
        <p>Visitors, pageviews, devices and campaigns — streaming live from a single script tag.</p>
        <div className="auth-mock"><HeroMock /></div>
      </div>
    </div>
  );
}

export function FrameworkIcon({ name }: { name: string }) {
  const map: Record<string, string> = {
    react: "#61dafb", vue: "#42b883", angular: "#dd0031", svelte: "#ff3e00", other: "#98a2b3",
  };
  return <span className="fw-dot" style={{ background: map[name] ?? map.other }} />;
}
