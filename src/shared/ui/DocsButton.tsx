import { useEffect, useSyncExternalStore } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

const DOCS_BASE = "https://quantalog.daorbit.in/docs";

let current: { id: number; path: string } | null = null;
let nextId = 0;
const listeners = new Set<() => void>();

function setCurrent(value: typeof current) {
  current = value;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function useCurrentDocsPath(): string | null {
  return useSyncExternalStore(subscribe, () => current?.path ?? null);
}

/**
 * Link out to the hosted docs site, for pages whose header has room for a
 * second affordance next to `PageHelpButton` — that one explains the page
 * you're on, this one hands off to the full documentation.
 */
export function DocsButton({ path = "" }: { path?: string }) {
  const { t } = useTranslation();
  const label = t("nav.documentation");

  useEffect(() => {
    const id = ++nextId;
    setCurrent({ id, path });
    return () => {
      if (current?.id === id) setCurrent(null);
    };
  }, [path]);

  return (
    <Tooltip label={label} withArrow>
      <ActionIcon
        component="a"
        href={`${DOCS_BASE}${path}`}
        target="_blank"
        rel="noreferrer"
        variant="default"
        size="lg"
        radius="md"
        aria-label={label}
        className="docs-button"
      >
        <BookOpen size={17} />
      </ActionIcon>
    </Tooltip>
  );
}

export function HeaderDocsButton() {
  const { t } = useTranslation();
  const path = useCurrentDocsPath();
  if (path === null) return null;
  const label = t("nav.documentation");

  return (
    <ActionIcon
      component="a"
      href={`${DOCS_BASE}${path}`}
      target="_blank"
      rel="noreferrer"
      variant="subtle"
      color="gray"
      size="lg"
      radius="md"
      aria-label={label}
    >
      <BookOpen size={18} />
    </ActionIcon>
  );
}
