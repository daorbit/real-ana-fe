import type { ReactNode } from "react";
import { useMasonryRows } from "@/shared/hooks/useMasonryRows";
import classes from "./BioStats.module.css";

export function Masonry({ children }: { children: ReactNode }) {
  return <div className={classes.masonry}>{children}</div>;
}

export function MasonryItem({ children }: { children: ReactNode }) {
  const ref = useMasonryRows();
  return (
    <div ref={ref} className={classes.masonryItem}>
      {children}
    </div>
  );
}
