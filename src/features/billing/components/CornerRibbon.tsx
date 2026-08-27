export function CornerRibbon({
  label,
  color,
  background,
  fg = "#fff",
}: {
  label: string;
  color: string;
  background?: string;
  fg?: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: 14,
        right: -8,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          background: background ?? color,
          color: fg,
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          padding: "5px 10px",
          borderRadius: "4px 0 0 4px",
          // A notch cut into the left edge gives the tab its flag shape.
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%, 7px 50%)",
          paddingLeft: 16,
          whiteSpace: "nowrap",
          lineHeight: 1.2,
        }}
      >
        {label}
      </div>
      {/* The fold, tucked under the tail and darkened so it reads as shadow.
          Always the flat colour, never the gradient — a gradient across 8px
          reads as a colour mismatch rather than as a fold. */}
      <div
        style={{
          width: 8,
          height: 8,
          background: color,
          filter: "brightness(0.55)",
          clipPath: "polygon(0 0, 100% 0, 100% 100%)",
        }}
      />
    </div>
  );
}
