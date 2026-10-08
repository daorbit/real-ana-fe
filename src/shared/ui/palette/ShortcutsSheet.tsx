import { Modal } from "@mantine/core";
import { GLOBAL_SHORTCUTS, GO_SHORTCUTS } from "@/shared/ui/palette/goShortcuts";
import { KeyCaps } from "@/shared/ui/palette/KeyCaps";
import classes from "@/shared/ui/palette/Palette.module.css";

export default function ShortcutsSheet({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  return (
    <Modal opened={opened} onClose={onClose} title="Keyboard shortcuts" size="lg">
      <section className={classes.sheetGroup}>
        <p className={classes.sheetTitle}>General</p>
        <div className={classes.sheetGrid}>
          {GLOBAL_SHORTCUTS.map((s) => (
            <div key={s.label} className={classes.sheetRow}>
              {s.label}
              <KeyCaps keys={s.keys} className={classes.sheetKeys} />
            </div>
          ))}
        </div>
      </section>
      <section className={classes.sheetGroup}>
        <p className={classes.sheetTitle}>Go to</p>
        <div className={classes.sheetGrid}>
          {GO_SHORTCUTS.map((s) => (
            <div key={s.key} className={classes.sheetRow}>
              {s.label}
              <KeyCaps keys={["G", s.key.toUpperCase()]} then className={classes.sheetKeys} />
            </div>
          ))}
        </div>
      </section>
    </Modal>
  );
}
