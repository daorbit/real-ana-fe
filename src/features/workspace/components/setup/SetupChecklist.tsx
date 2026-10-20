import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { CopyButton, UnstyledButton } from "@mantine/core";
import { ArrowUpRight, Check, Copy, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ADD_SITE_PATH } from "@/features/workspace/paths";
import { trackingSnippet } from "@/features/workspace/tracker";
import type { Site } from "@/shared/types";
import classes from "./SetupScreen.module.css";

function Item({
  n,
  done,
  title,
  detail,
  action,
}: {
  n: number;
  done?: boolean;
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  return (
    <li className={classes.item} data-done={done || undefined}>
      <span className={classes.itemMark}>{done ? <Check size={14} strokeWidth={3} /> : n}</span>
      <span className={classes.itemMain}>
        <span className={classes.itemText}>
          <span className={classes.itemTitle}>{title}</span>
          <span className={classes.itemDetail}>{detail}</span>
        </span>
        {action}
      </span>
    </li>
  );
}

export function SetupChecklist({ site, canEdit }: { site: Site | null; canEdit: boolean }) {
  const { t } = useTranslation();

  return (
    <ol className={classes.checklist}>
      <Item
        n={1}
        done={Boolean(site)}
        title={t("setup.itemAdd", "Add your site")}
        detail={site ? site.domain || site.name : t("setup.itemAddDetail", "Your domain, so we can build the snippet")}
        action={
          !site &&
          canEdit && (
            <Link to={ADD_SITE_PATH} className={classes.chip}>
              <Plus size={13} />
              {t("setup.add", "Add")}
            </Link>
          )
        }
      />
      <Item
        n={2}
        title={t("setup.itemPaste", "Paste the snippet")}
        detail={t("setup.itemPasteDetail", "One line, before </head> on every page")}
        action={
          site && (
            <CopyButton value={trackingSnippet(site.siteId, site.trackerOptions)}>
              {({ copied, copy }) => (
                <UnstyledButton className={classes.chip} onClick={copy} data-copied={copied || undefined}>
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? t("workspaces.copied", "Copied") : t("setup.copy", "Copy")}
                </UnstyledButton>
              )}
            </CopyButton>
          )
        }
      />
      <Item
        n={3}
        title={t("setup.itemVisit", "Open your site")}
        detail={t("setup.itemVisitDetail", "Your first visit brings this page to life")}
        action={
          site?.domain && (
            <a className={classes.chip} href={`https://${site.domain}`} target="_blank" rel="noopener noreferrer">
              <ArrowUpRight size={13} />
              {t("setup.open", "Open")}
            </a>
          )
        }
      />
    </ol>
  );
}
