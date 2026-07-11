// Inline SVG brand assets — self-contained, no external images (survive strict CSP).
import { FRAMEWORK_COLORS } from "../utils";

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-label="Vantage">
      <defs>
        <linearGradient id="lg" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34d399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="34" height="34" rx="11" fill="url(#lg)" />
      <rect x="1" y="1" width="34" height="34" rx="11" fill="url(#lg)" opacity="0.4" style={{ filter: "blur(6px)" }} />
      <path
        d="M8 19h4.2l2.3-7.5 4 15 2.6-11 1.7 3.5H28"
        stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
    </svg>
  );
}

export function Wordmark() {
  return (
    <div className="wordmark">
      <span className="wordmark-text">Vantage<span className="wordmark-dot">.</span></span>
    </div>
  );
}

// Dark premium dashboard mockup rendered entirely in SVG.
export function HeroMock() {
  return (
    <svg viewBox="0 0 520 340" className="hero-mock" role="img" aria-label="Analytics dashboard preview">
      <defs>
        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#10b981" stopOpacity="0.5" />
          <stop offset="1" stopColor="#059669" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="win" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#1a1b22" />
          <stop offset="1" stopColor="#141519" />
        </linearGradient>
        <linearGradient id="ln" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#34d399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="520" height="340" rx="16" fill="url(#win)" stroke="#2a2c36" />
      <circle cx="22" cy="22" r="4" fill="#f87171" />
      <circle cx="38" cy="22" r="4" fill="#fbbf24" />
      <circle cx="54" cy="22" r="4" fill="#34d399" />
      <line x1="0" y1="44" x2="520" y2="44" stroke="#2a2c36" />

      {[
        { x: 20, label: "Visitors", val: "12.8k", c: "#34d399" },
        { x: 190, label: "Pageviews", val: "48.2k", c: "#f3f4f6" },
        { x: 360, label: "Live", val: "326", c: "#34d399", live: true },
      ].map((k) => (
        <g key={k.label} transform={`translate(${k.x},62)`}>
          <rect width="140" height="60" rx="11" fill="#1f2029" stroke="#2a2c36" />
          <text x="14" y="28" fill={k.c} fontSize="21" fontWeight="700">{k.val}</text>
          <text x="14" y="47" fill="#7b8194" fontSize="11">{k.label}</text>
          {k.live && <circle cx="118" cy="18" r="4" fill="#34d399" className="pulse-dot" />}
        </g>
      ))}

      <g transform="translate(20,142)">
        <rect width="480" height="120" rx="11" fill="#1f2029" stroke="#2a2c36" />
        <path className="hero-area" d="M20 95 L70 72 L120 82 L170 50 L220 64 L270 32 L320 46 L370 24 L420 42 L460 20 L460 108 L20 108 Z" fill="url(#area)" />
        <path className="hero-line" d="M20 95 L70 72 L120 82 L170 50 L220 64 L270 32 L320 46 L370 24 L420 42 L460 20" fill="none" stroke="url(#ln)" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      <g transform="translate(20,278)">
        {[70, 55, 40, 28].map((w, i) => (
          <rect key={i} y={i * 15} width={w * 4} height="9" rx="3" fill="#10b981" opacity={0.8 - i * 0.15} />
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

// Friendly animated analytics illustration for empty states.
export function AnalyticsArt() {
  return (
    <svg viewBox="0 0 260 150" width="260" height="150" role="img" aria-label="Analytics illustration">
      <defs>
        <linearGradient id="aa-bar" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#34d399" /><stop offset="1" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="aa-line" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#22d3ee" /><stop offset="1" stopColor="#34d399" />
        </linearGradient>
      </defs>
      {/* baseline */}
      <line x1="24" y1="120" x2="236" y2="120" stroke="var(--border)" strokeWidth="1.5" />
      {/* bars */}
      {[
        { x: 40, h: 42 }, { x: 78, h: 70 }, { x: 116, h: 54 }, { x: 154, h: 92 }, { x: 192, h: 66 },
      ].map((b, i) => (
        <rect key={i} x={b.x} width="26" rx="6" fill="url(#aa-bar)" opacity={0.85}>
          <animate attributeName="height" from="0" to={b.h} dur="0.8s" begin={`${i * 0.1}s`} fill="freeze" />
          <animate attributeName="y" from="120" to={120 - b.h} dur="0.8s" begin={`${i * 0.1}s`} fill="freeze" />
        </rect>
      ))}
      {/* trend line */}
      <path d="M40 78 L91 52 L129 66 L167 34 L205 56" fill="none" stroke="url(#aa-line)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="260" strokeDashoffset="260">
        <animate attributeName="stroke-dashoffset" from="260" to="0" dur="1.1s" begin="0.5s" fill="freeze" />
      </path>
      {/* dots */}
      {[[40,78],[91,52],[129,66],[167,34],[205,56]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="4" fill="#fff" stroke="#059669" strokeWidth="2" opacity="0">
          <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin={`${0.8 + i * 0.08}s`} fill="freeze" />
        </circle>
      ))}
    </svg>
  );
}

export function FrameworkIcon({ name }: { name: string }) {
  return (
    <span
      className="fw-dot"
      style={{ background: FRAMEWORK_COLORS[name] ?? FRAMEWORK_COLORS.other }}
    />
  );
}
