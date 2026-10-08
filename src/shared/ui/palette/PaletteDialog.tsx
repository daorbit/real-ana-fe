import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Modal, ScrollArea, Text, TextInput } from "@mantine/core";
import { ArrowDown, ArrowUp, CornerDownLeft, Search } from "lucide-react";
import { usePaletteCommands } from "@/shared/ui/palette/usePaletteCommands";
import { usePaletteResults } from "@/shared/ui/palette/usePaletteResults";
import { pushRecent } from "@/shared/ui/palette/recentCommands";
import { PaletteRow } from "@/shared/ui/palette/PaletteRow";
import type { PaletteCommand } from "@/shared/ui/palette/types";
import classes from "@/shared/ui/palette/Palette.module.css";

export default function PaletteDialog({
  opened,
  onClose,
  onOpenShortcuts,
}: {
  opened: boolean;
  onClose: () => void;
  onOpenShortcuts: () => void;
}) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    onClose();
    setQuery("");
    setCursor(0);
  }, [onClose]);

  const commands = usePaletteCommands(close, onOpenShortcuts);
  const results = usePaletteResults(commands, query, close);

  useEffect(() => setCursor(0), [query]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${cursor}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const run = (c: PaletteCommand) => {
    if (!c.id.startsWith("orbit:")) pushRecent(c.id.replace(/^recent:/, ""));
    c.run();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const n = Math.max(1, results.length);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((i) => (i + 1) % n);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((i) => (i - 1 + n) % n);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const c = results[cursor];
      if (c) run(c);
    }
  };

  let lastSection = "";

  return (
    <Modal
      opened={opened}
      onClose={close}
      withCloseButton={false}
      padding={0}
      radius="lg"
      size="lg"
      yOffset="12vh"
      centered={false}
      transitionProps={{ transition: "pop", duration: 160 }}
      overlayProps={{ backgroundOpacity: 0.55, blur: 4 }}
      classNames={{ body: classes.body }}
    >
      <div className={classes.searchBar}>
        <TextInput
          data-autofocus
          variant="unstyled"
          size="md"
          placeholder="Search pages, dashboards, notes, actions…"
          leftSection={<Search size={16} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          onKeyDown={onKeyDown}
          aria-label="Command search"
        />
      </div>

      <ScrollArea.Autosize mah={400} className={classes.list}>
        <div ref={listRef} role="listbox">
          {results.length === 0 && (
            <Text size="sm" c="dimmed" className={classes.empty}>
              Nothing found
            </Text>
          )}
          {results.map((c, i) => {
            const heading = c.section !== lastSection ? c.section : null;
            lastSection = c.section;
            return (
              <div key={c.id}>
                {heading && <p className="cmdk-section">{heading}</p>}
                <PaletteRow command={c} index={i} active={i === cursor} onHover={setCursor} onRun={run} />
              </div>
            );
          })}
        </div>
      </ScrollArea.Autosize>

      <div className={classes.footer}>
        <span className={classes.footerItem}>
          <kbd className="kbd"><ArrowUp size={10} /></kbd>
          <kbd className="kbd"><ArrowDown size={10} /></kbd>
          navigate
        </span>
        <span className={classes.footerItem}>
          <kbd className="kbd"><CornerDownLeft size={10} /></kbd>
          open
        </span>
        <span className={`${classes.footerItem} ${classes.footerEnd}`}>
          <kbd className="kbd">?</kbd>
          all shortcuts
        </span>
      </div>
    </Modal>
  );
}
