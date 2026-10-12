import type { ReactNode } from "react";
import styles from "./StatTile.module.css";

export function StatTileGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}

export function StatTile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className={styles.tile}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      {note && <span className={styles.note}>{note}</span>}
    </div>
  );
}
