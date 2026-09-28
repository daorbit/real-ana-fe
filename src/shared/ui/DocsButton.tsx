import { useEffect, useSyncExternalStore } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { docsUrl, type DocsSlug } from "@/shared/lib/docsSlugs";

let current: { id: number; path: DocsSlug } | null = null;
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

function useCurrentDocsPath(): DocsSlug | null {
  return useSyncExternalStore(subscribe, () => current?.path ?? null);
}

/**
 * Link out to the hosted docs site, for pages whose header has room for a
 * second affordance next to `PageHelpButton` — that one explains the page
 * you're on, this one hands off to the full documentation.
 */
export function DocsButton({ path }: { path?: DocsSlug }) {
  const { t } = useTranslation();
  const label = t("nav.documentation");

  useEffect(() => {
    if (!path) return;
    const id = ++nextId;
    setCurrent({ id, path });
    return () => {
      if (current?.id === id) setCurrent(null);
    };
  }, [path]);

  if (!path) return null;

  return (
    <Tooltip label={label} withArrow>
      <ActionIcon
        component="a"
        href={docsUrl(path)}
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
      href={docsUrl(path)}
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
