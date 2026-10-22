import classes from "./QuantalogMark.module.css";

export function QuantalogMark({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/brand-mark.png"
      alt="Quantalog"
      width={size}
      height={size}
      decoding="sync"
      fetchPriority="high"
      className={classes.mark}
    />
  );
}
