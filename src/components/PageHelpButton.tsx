import { useState } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { HelpCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HelpDrawer } from "./HelpDrawer";
import { getPageHelp } from "./pageHelp";

/**
 * The "what's on this page" button, for pages whose help is a fixed set of
 * sections rather than something that tracks a tab.
 *
 * It carries its own drawer so a page adopts it by dropping it into
 * `PageHeader`'s `actions` — no state, no import of the help content, no
 * drawer of its own. The sections come from `getPageHelp`, keyed on the
 * current route and translated on the spot, and the button renders nothing at
 * all on a route with no entry — so it is safe to place speculatively.
 *
 * Analytics and SEO don't use this: their help opens selected to the tab you
 * are on, which needs state the page already owns.
 */
export function PageHelpButton() {
  const { t } = useTranslation();
  const loc = useLocation();
  const [opened, setOpened] = useState(false);

  // Re-resolved each render so switching language re-translates an open drawer
  // rather than leaving it in the language it was opened in.
  const help = getPageHelp(loc.pathname, t);
  if (!help) return null;

  const label = t("nav.pageHelp");

  return (
    <>
      <Tooltip label={label} withArrow>
        <ActionIcon
          variant="default"
          size="lg"
          radius="md"
          onClick={() => setOpened(true)}
          aria-label={label}
        >
          <HelpCircle size={17} />
        </ActionIcon>
      </Tooltip>
      <HelpDrawer
        opened={opened}
        onClose={() => setOpened(false)}
        title={help.title}
        sections={help.sections}
      />
    </>
  );
}
