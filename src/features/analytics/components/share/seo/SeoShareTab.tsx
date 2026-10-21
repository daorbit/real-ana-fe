import { useState } from "react";
import { Center, Select, Skeleton, Stack, Text, ThemeIcon } from "@mantine/core";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGetSeoShareLinksQuery, useGetSitesQuery } from "@/app/store";
import { SectionHead } from "../SectionHead";
import { ShareFootnote } from "../ShareFootnote";
import { PanelSwitchList } from "../PanelSwitchList";
import { PanelCountActions } from "../PanelCountActions";
import { SeoLinkRow } from "./SeoLinkRow";
import { SEO_ALL_PANELS, SEO_PANEL_GROUPS } from "./seoPanels";
import { useSeoSharePanels } from "./useSeoSharePanels";
import { useReplaceSeoLink } from "./useReplaceSeoLink";
import { useRemoveSeoPage } from "./useRemoveSeoPage";
import classes from "../Share.module.css";

export function SeoShareTab({ workspaceId }: { workspaceId: string }) {
  const { t } = useTranslation();
  const { currentData: sites = [], isLoading: sitesLoading } = useGetSitesQuery(workspaceId, { skip: !workspaceId });
  const [siteId, setSiteId] = useState("");
  const activeSiteId = (sites.find((s) => s.siteId === siteId) ?? sites[0])?.siteId ?? "";

  const { data, isLoading: linksLoading } = useGetSeoShareLinksQuery(
    { workspaceId, siteId: activeSiteId },
    { skip: !activeSiteId },
  );
  const links = data?.links ?? [];
  const panels = useSeoSharePanels(workspaceId);
  const replace = useReplaceSeoLink(workspaceId, activeSiteId);
  const removePage = useRemoveSeoPage(workspaceId, activeSiteId);

  if (sitesLoading) {
    return (
      <div className={classes.stack}>
        <Skeleton height={120} radius="md" />
        <Skeleton height={240} radius="md" />
      </div>
    );
  }

  if (!sites.length) {
    return (
      <Center py={48}>
        <Stack align="center" gap={8} maw={400}>
          <ThemeIcon variant="light" color="gray" size={48} radius="md">
            <Globe size={22} />
          </ThemeIcon>
          <Text fw={650} mt={4}>{t("share.seoNoSitesTitle")}</Text>
          <Text c="dimmed" size="sm" ta="center">{t("share.seoNoSitesBody")}</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <div className={classes.stack}>
      <section>
        <SectionHead
          title={t("share.seoSectionTitle")}
          description={t("share.seoSectionDesc")}
          actions={
            sites.length > 1 && (
              <Select
                data={sites.map((s) => ({ value: s.siteId, label: s.name }))}
                value={activeSiteId}
                onChange={(v) => v && setSiteId(v)}
                allowDeselect={false}
                size="xs"
                w={200}
                leftSection={<Globe size={14} />}
                aria-label="Site"
              />
            )
          }
        />
        {linksLoading ? (
          <Skeleton height={120} radius="md" />
        ) : links.length ? (
          <div className={classes.card}>
            {links.map((link) => (
              <SeoLinkRow
                key={link.reportId}
                link={link}
                onReplace={() => replace(link.reportId)}
                onRemove={() => removePage(link)}
              />
            ))}
          </div>
        ) : (
          <div className={classes.card}>
            <Text size="sm" c="dimmed" p="lg">{t("share.seoNoAudits")}</Text>
          </div>
        )}
      </section>

      <section>
        <SectionHead
          title={t("share.seoReaderSees", "What readers see")}
          description={t("share.seoReaderSeesDesc", "Applies to every report link. Sections turned off are removed on the server, not just hidden.")}
          actions={<PanelCountActions on={panels.onCount} total={SEO_ALL_PANELS.length} onSetAll={panels.setAll} />}
        />
        {panels.loading ? (
          <Skeleton height={200} radius="md" />
        ) : (
          <PanelSwitchList groups={SEO_PANEL_GROUPS} values={panels.panels} onToggle={panels.setPanel} />
        )}
      </section>

      <ShareFootnote title={t("share.seoNeverTitle")} body={t("share.seoNeverBody")} />
    </div>
  );
}
