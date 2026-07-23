import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, TextInput, ScrollArea, Text, Box, UnstyledButton } from "@mantine/core";
import { useMantineColorScheme, useComputedColorScheme } from "@mantine/core";
import {
  Home, BarChart3, FolderKanban, Code2, Share2, Users, Settings as SettingsIcon,
  Search, Moon, Sun, BookOpen, CornerDownLeft,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useWorkspace } from "../workspace";
import { useAuth } from "../auth";

type Command = {
  id: string;
  label: string;
  /** Groups the command in the list, and is searched alongside the label. */
  section: string;
  icon: LucideIcon;
  hint?: string;
  run: () => void;
};

/**
 * Cmd/Ctrl-K palette: jump to any page, switch workspace, or toggle the theme
 * without reaching for the mouse.
 *
 * Every entry here is reachable through the UI as well — the palette is a
 * shortcut for people who already know where they are going, never the only
 * path to something.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);

  const navigate = useNavigate();
  const { workspaces, active, setActive } = useWorkspace();
  const { user } = useAuth();
  const { setColorScheme } = useMantineColorScheme();
  const scheme = useComputedColorScheme("light");
  const dark = scheme === "dark";

  const isAdmin = user?.role === "admin" && !user?.impersonating;

  // Global hotkey. Bound on the window so it works from anywhere, including
  // while a field elsewhere on the page has focus.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const close = () => {
    setOpen(false);
    setQuery("");
    setCursor(0);
  };

  const commands = useMemo<Command[]>(() => {
    const go = (to: string) => () => {
      navigate(to);
      close();
    };

    const pages: Command[] = [
      { id: "home", label: "Home", section: "Go to", icon: Home, run: go("/app") },
      { id: "analytics", label: "Analytics", section: "Go to", icon: BarChart3, run: go("/app/analytics") },
      { id: "seo", label: "SEO", section: "Go to", icon: Search, run: go("/app/seo") },
      { id: "workspaces", label: "Workspaces", section: "Go to", icon: FolderKanban, run: go("/app/workspaces") },
      { id: "share", label: "Public dashboard", section: "Go to", icon: Share2, run: go("/app/share") },
      { id: "developers", label: "Developers", section: "Go to", icon: Code2, run: go("/app/developers") },
      { id: "settings", label: "Settings", section: "Go to", icon: SettingsIcon, run: go("/app/settings") },
    ];

    if (isAdmin) {
      pages.push({
        id: "impersonate",
        label: "View as user",
        section: "Go to",
        icon: Users,
        run: go("/app/impersonate"),
      });
    }

    // Switching to the workspace you are already in is a no-op, so it is left
    // out rather than shown as a dead entry.
    const wsCommands: Command[] = workspaces
      .filter((w) => w._id !== active?._id)
      .map((w) => ({
        id: `ws-${w._id}`,
        label: w.name,
        section: "Switch workspace",
        icon: FolderKanban,
        hint: "workspace",
        run: () => {
          setActive(w._id);
          close();
        },
      }));

    const actions: Command[] = [
      {
        id: "theme",
        label: dark ? "Switch to light mode" : "Switch to dark mode",
        section: "Actions",
        icon: dark ? Sun : Moon,
        run: () => {
          setColorScheme(dark ? "light" : "dark");
          close();
        },
      },
      {
        id: "docs",
        label: "Open documentation",
        section: "Actions",
        icon: BookOpen,
        run: () => {
          window.open("https://quantalog.daorbit.in/docs", "_blank", "noreferrer");
          close();
        },
      },
    ];

    return [...pages, ...wsCommands, ...actions];
    // `close` is stable in effect: it only touches setState setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaces, active?._id, isAdmin, dark, navigate, setActive, setColorScheme]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) || c.section.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // A filtered list can be shorter than the last cursor position.
  useEffect(() => setCursor(0), [query]);

  const listRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((i) => (i + 1) % Math.max(1, results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((i) => (i - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      results[cursor]?.run();
    }
  };

  // Keep the highlighted row in view while arrowing through a long list.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${cursor}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  let lastSection = "";

  return (
    <Modal
      opened={open}
      onClose={close}
      withCloseButton={false}
      padding={0}
      radius="lg"
      size="lg"
      transitionProps={{ transition: "pop", duration: 160 }}
      overlayProps={{ backgroundOpacity: 0.55, blur: 4 }}
      styles={{ body: { padding: 0 } }}
    >
      <Box p="xs" style={{ borderBottom: "1px solid var(--border)" }}>
        <TextInput
          data-autofocus
          variant="unstyled"
          size="md"
          placeholder="Search pages, workspaces, actions…"
          leftSection={<Search size={16} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          onKeyDown={onKeyDown}
        />
      </Box>

      <ScrollArea.Autosize mah={380} p={6}>
        <div ref={listRef}>
          {results.length === 0 && (
            <Text size="sm" c="dimmed" ta="center" py="lg">
              No matches for “{query}”
            </Text>
          )}

          {results.map((c, i) => {
            const heading = c.section !== lastSection ? c.section : null;
            lastSection = c.section;
            const Icon = c.icon;
            return (
              <div key={c.id}>
                {heading && <p className="cmdk-section">{heading}</p>}
                <UnstyledButton
                  className="cmdk-item"
                  data-index={i}
                  data-active={i === cursor}
                  onMouseEnter={() => setCursor(i)}
                  onClick={c.run}
                >
                  <Icon size={16} style={{ flexShrink: 0 }} />
                  <Text size="sm" truncate>{c.label}</Text>
                  {c.hint && <span className="cmdk-item__hint">{c.hint}</span>}
                  {i === cursor && (
                    <CornerDownLeft
                      size={13}
                      style={{ marginLeft: c.hint ? 8 : "auto", opacity: 0.6 }}
                    />
                  )}
                </UnstyledButton>
              </div>
            );
          })}
        </div>
      </ScrollArea.Autosize>
    </Modal>
  );
}
