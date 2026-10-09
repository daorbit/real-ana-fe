export const SPOTLIGHT_GLOW_ID = "wm-spot-glow";

export function SpotlightGlow({ zoom }: { zoom: number }) {
  return (
    <filter id={SPOTLIGHT_GLOW_ID} x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceGraphic" stdDeviation={4 / zoom} result="blur" />
      <feComponentTransfer in="blur" result="soft">
        <feFuncA type="linear" slope="0.6" />
      </feComponentTransfer>
      <feMerge>
        <feMergeNode in="soft" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
}
