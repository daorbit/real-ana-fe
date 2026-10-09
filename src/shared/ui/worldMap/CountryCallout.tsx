import { CALLOUT, formatShare, type Spotlight } from "./spotlight";

export function CountryCallout({ spot }: { spot: Spotlight }) {
  const { x, y, width, unit, tone, shape } = spot;
  const [ax, ay] = shape.anchor;

  return (
    <g className="map-callout">
      <path d={spot.leader} className="map-callout-line" stroke={tone.to} />
      <circle cx={ax} cy={ay} r={5 * unit} className="map-callout-halo" fill={tone.from} />
      <circle cx={ax} cy={ay} r={2.4 * unit} className="map-callout-anchor" />
      <g transform={`translate(${x} ${y}) scale(${unit})`}>
        <rect width={width} height={CALLOUT.height} rx={CALLOUT.radius} className="map-callout-box" stroke={tone.to} />
        <circle cx={12} cy={14} r={3.6} fill={tone.from} />
        <text x={CALLOUT.padLeft} y={17.5} className="map-callout-name">
          {spot.label}
          <title>{`${spot.fullName}: ${spot.count.toLocaleString()}`}</title>
        </text>
        <text x={CALLOUT.padLeft} y={33} className="map-callout-value">
          {formatShare(spot.share)}
        </text>
      </g>
    </g>
  );
}
