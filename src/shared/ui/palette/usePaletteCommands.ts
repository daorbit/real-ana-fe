import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import {
  BookOpen, FolderKanban, Keyboard, LayoutDashboard, Moon, Orbit, Plus, StickyNote, Sun,
} from "lucide-react";
import { NAV_GROUPS, ADMIN_ITEMS } from "@/app/shell/navItems";
import { useWorkspace } from "@/features/workspace/context";
import { useNotes } from "@/features/notes";
import { useGetNotesQuery } from "@/features/notes/api";
import { useGetDashboardsQuery } from "@/features/dashboards/api";
import { useIsPlatformAdmin } from "@/features/auth/context";
import { SETTINGS_SECTIONS, settingsPath } from "@/features/auth/components/settings/settingsSections";
import { DOCS_BASE_URL } from "@/shared/lib/docsSlugs";
import { GO_BY_PATH } from "@/shared/ui/palette/goShortcuts";
import type { PaletteCommand } from "@/shared/ui/palette/types";

const EMPTY: never[] = [];

export function usePaletteCommands(close: () => void, openShortcuts: () => void): PaletteCommand[] {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { workspaces, active, setActive } = useWorkspace();
  const { open: openNotes } = useNotes();
  const { setColorScheme } = useMantineColorScheme();
  const dark = useComputedColorScheme("light") === "dark";
  const isAdmin = useIsPlatformAdmin();
  const workspaceId = active?._id ?? "";

  const { data: dashboards = EMPTY } = useGetDashboardsQuery(workspaceId, { skip: !workspaceId });
  const { data: notes = EMPTY } = useGetNotesQuery();

  return useMemo<PaletteCommand[]>(() => {
    const go = (to: string) => () => {
      navigate(to);
      close();
    };

    const pages: PaletteCommand[] = NAV_GROUPS.flatMap((group) =>
      group.items.map((item) => {
        const key = GO_BY_PATH.get(item.to);
        return {
          id: `page:${item.to}`,
          label: t(item.labelKey, item.label),
          section: "Go to",
          icon: item.icon,
          keys: key ? ["G", key.toUpperCase()] : undefined,
          keywords: t(group.headingKey, group.heading),
          run: go(item.to),
        };
      }),
    );

    pages.push({
      id: "page:/app/orbit",
      label: "Orbit AI",
      section: "Go to",
      icon: Orbit,
      keys: ["G", "O"],
      keywords: "assistant chat ai",
      run: go("/app/orbit"),
    });

    const settings: PaletteCommand[] = SETTINGS_SECTIONS.map((s) => ({
      id: `settings:${s.id}`,
      label: `Settings: ${s.label}`,
      section: "Settings",
      icon: s.icon,
      run: go(settingsPath(s.id)),
    }));

    const admin: PaletteCommand[] = isAdmin
      ? ADMIN_ITEMS.map((item) => ({
          id: `admin:${item.to}`,
          label: t(item.labelKey, item.label),
          section: "Admin",
          icon: item.icon,
          run: go(item.to),
        }))
      : [];

    const content: PaletteCommand[] = [
      ...dashboards.map((d) => ({
        id: `dashboard:${d.id}`,
        label: d.name,
        section: "Dashboards",
        icon: LayoutDashboard,
        hint: "dashboard",
        keywords: d.description,
        run: go(`/app/dashboards/${d.id}`),
      })),
      ...notes.map((n) => ({
        id: `note:${n.id}`,
        label: n.title || "Untitled note",
        section: "Notes",
        icon: StickyNote,
        hint: "note",
        keywords: n.body.slice(0, 400),
        run: () => {
          openNotes(n.id);
          close();
        },
      })),
    ];

    const switches: PaletteCommand[] = workspaces
      .map((w, i) => ({ w, i }))
      .filter(({ w }) => w._id !== active?._id)
      .map(({ w, i }) => ({
        id: `ws:${w._id}`,
        label: w.name,
        section: "Switch workspace",
        icon: FolderKanban,
        keys: i < 9 ? ["Ctrl", String(i + 1)] : undefined,
        run: () => {
          setActive(w._id);
          close();
        },
      }));

    const actions: PaletteCommand[] = [
      {
        id: "action:new-dashboard",
        label: "New dashboard",
        section: "Actions",
        icon: Plus,
        keywords: "create template",
        run: go("/app/dashboards/new"),
      },
      {
        id: "action:notes",
        label: "Open notes",
        section: "Actions",
        icon: StickyNote,
        keys: ["N"],
        run: () => {
          openNotes();
          close();
        },
      },
      {
        id: "action:theme",
        label: dark ? "Switch to light mode" : "Switch to dark mode",
        section: "Actions",
        icon: dark ? Sun : Moon,
        keywords: "theme appearance",
        run: () => {
          setColorScheme(dark ? "light" : "dark");
          close();
        },
      },
      {
        id: "action:shortcuts",
        label: "Keyboard shortcuts",
        section: "Actions",
        icon: Keyboard,
        keys: ["?"],
        keywords: "hotkeys keys help",
        run: () => {
          close();
          openShortcuts();
        },
      },
      {
        id: "action:docs",
        label: "Open documentation",
        section: "Actions",
        icon: BookOpen,
        keywords: "help guide",
        run: () => {
          window.open(DOCS_BASE_URL, "_blank", "noreferrer");
          close();
        },
      },
    ];

    return [...pages, ...content, ...actions, ...switches, ...settings, ...admin];
  }, [
    navigate, t, close, openShortcuts, dashboards, notes, workspaces, active?._id, setActive,
    openNotes, dark, setColorScheme, isAdmin,
  ]);
}
