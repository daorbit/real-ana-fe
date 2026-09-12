import { ActionIcon, Tooltip } from "@mantine/core";
import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Link out to the hosted docs site, for pages whose header has room for a
 * second affordance next to `PageHelpButton` — that one explains the page
 * you're on, this one hands off to the full documentation.
 */
export function DocsButton({ path = "" }: { path?: string }) {
  const { t } = useTranslation();
  const label = t("nav.documentation");

  return (
    <Tooltip label={label} withArrow>
      <ActionIcon
        component="a"
        href={`https://quantalog.daorbit.in/docs${path}`}
        target="_blank"
        rel="noreferrer"
        variant="default"
        size="lg"
        radius="md"
        aria-label={label}
      >
        <BookOpen size={17} />
      </ActionIcon>
    </Tooltip>
  );
}
