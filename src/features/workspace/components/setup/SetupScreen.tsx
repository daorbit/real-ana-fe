import { Link } from "react-router-dom";
import { Button } from "@mantine/core";
import { ArrowRight, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/features/workspace/context";
import { ADD_SITE_PATH, siteInstallPath } from "@/features/workspace/paths";
import type { SetupState } from "@/features/workspace/setupState";
import { PageHeader } from "@/shared/ui/Page";
import { DOCS_SLUGS, docsUrl } from "@/shared/lib/docsSlugs";
import { SetupAddressBar } from "./SetupAddressBar";
import { SetupChecklist } from "./SetupChecklist";
import { SetupVerifyButton } from "./SetupVerifyButton";
import classes from "./SetupScreen.module.css";

export function SetupScreen({
  pageTitle,
  state,
  workspaceId,
  onVerified,
}: {
  pageTitle: string;
  state: NonNullable<SetupState>;
  workspaceId: string;
  onVerified: () => void;
}) {
  const { t } = useTranslation();
  const { canEdit } = usePermissions();
  const site = state.kind === "unverified" ? state.sites[0] : null;
  const many = state.kind === "unverified" && state.sites.length > 1;

  const title = site
    ? many
      ? t("setup.waitingMany", "Waiting for your first visit")
      : t("setup.waitingOne", { defaultValue: "Waiting for the first visit to {{site}}", site: site.domain || site.name })
    : t("setup.noSiteTitle", "Add your website");

  const body = site
    ? t(
        "setup.waitingBody",
        "Add the snippet to your site and open it in a browser. This page becomes your live dashboard the moment the first visit arrives.",
      )
    : t(
        "setup.noSiteBody",
        "Quantalog starts counting from your site's first visit. Add your domain and you'll get a one-line snippet to paste.",
      );

  return (
    <>
      <PageHeader title={pageTitle} docsPath={DOCS_SLUGS.tracking} />

      <section className={classes.screen}>
        <SetupAddressBar site={site} />

        <h1 className={classes.title}>{title}</h1>
        <p className={classes.body}>{body}</p>

        <SetupChecklist site={site} />

        <div className={classes.actions}>
          {site ? (
            <>
              <Button size="md" radius="xl" component={Link} to={siteInstallPath(site.siteId)} rightSection={<ArrowRight size={16} />}>
                {t("setup.installVerify", "Install & verify")}
              </Button>
              <SetupVerifyButton workspaceId={workspaceId} siteId={site.siteId} onVerified={onVerified} />
            </>
          ) : (
            canEdit && (
              <Button size="md" radius="xl" component={Link} to={ADD_SITE_PATH} leftSection={<Plus size={16} />}>
                {t("setup.addSite", "Add a site")}
              </Button>
            )
          )}
        </div>

        <a className={classes.help} href={docsUrl(DOCS_SLUGS.tracking)} target="_blank" rel="noreferrer">
          {t("setup.readGuide", "Read the setup guide")}
          <ArrowRight size={13} />
        </a>
      </section>
    </>
  );
}
