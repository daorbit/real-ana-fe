import { Link } from "react-router-dom";
import { Button } from "@mantine/core";
import { ArrowRight, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/features/workspace/context";
import { ADD_SITE_PATH, siteInstallPath } from "@/features/workspace/paths";
import type { SetupState } from "@/features/workspace/setupState";
import { PageHeader } from "@/shared/ui/Page";
import { DOCS_SLUGS } from "@/shared/lib/docsSlugs";
import { SetupOrb } from "./SetupOrb";
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
    : t("setup.noSiteTitle", "Add your website to get started");

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
        <span className={classes.glow} aria-hidden />

        <SetupOrb site={site} />

        <p className={classes.status} data-waiting={site ? true : undefined}>
          <span className={classes.statusDot} />
          {site ? t("setup.eyebrowWaiting", "Waiting for data") : t("setup.eyebrowStart", "Get started")}
        </p>
        <h1 className={classes.title}>{title}</h1>
        <p className={classes.body}>{body}</p>

        <SetupChecklist site={site} canEdit={canEdit} />

        <div className={classes.actions}>
          {site ? (
            <>
              <Button size="md" component={Link} to={siteInstallPath(site.siteId)} rightSection={<ArrowRight size={16} />}>
                {t("setup.installVerify", "Install & verify")}
              </Button>
              <SetupVerifyButton workspaceId={workspaceId} siteId={site.siteId} onVerified={onVerified} />
            </>
          ) : (
            canEdit && (
              <Button size="md" component={Link} to={ADD_SITE_PATH} leftSection={<Plus size={16} />}>
                {t("setup.addSite", "Add a site")}
              </Button>
            )
          )}
        </div>
      </section>
    </>
  );
}
