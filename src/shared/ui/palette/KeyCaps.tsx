import classes from "@/shared/ui/palette/Palette.module.css";

export function KeyCaps({ keys, then = false, className }: { keys: string[]; then?: boolean; className?: string }) {
  return (
    <span className={className ?? classes.keys}>
      {keys.map((k, i) => (
        <span key={`${k}-${i}`} className={classes.sheetKeys}>
          {then && i > 0 && <span className={classes.then}>then</span>}
          <kbd className="kbd">{k}</kbd>
        </span>
      ))}
    </span>
  );
}
