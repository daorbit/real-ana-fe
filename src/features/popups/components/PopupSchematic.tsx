import type { PopupLayout } from "@/features/popups/types";
import classes from "@/features/popups/components/PopupSchematic.module.css";

export function PopupSchematic({ layout, size = "md" }: { layout: PopupLayout; size?: "sm" | "md" | "lg" }) {
  return (
    <div className={classes.browser} data-size={size} aria-hidden>
      <div className={classes.bar}>
        <span className={classes.dot} />
        <span className={classes.dot} />
        <span className={classes.dot} />
        <span className={classes.address} />
      </div>
      <div className={classes.page}>
        <span className={classes.line} data-w="hero" />
        <span className={classes.line} data-w="long" />
        <span className={classes.line} data-w="mid" />
        <div className={classes.blocks}>
          <span className={classes.block} />
          <span className={classes.block} />
          <span className={classes.block} />
        </div>
        <span className={classes.line} data-w="short" />
        {layout === "modal" && <span className={classes.scrim} />}
        <div className={classes.popup} data-layout={layout}>
          <span className={classes.popupTitle} />
          <span className={classes.popupField} />
          <span className={classes.popupField} />
          <span className={classes.popupButton} />
        </div>
      </div>
    </div>
  );
}
