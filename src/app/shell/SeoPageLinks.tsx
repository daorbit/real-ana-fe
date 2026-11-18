import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { UnstyledButton } from "@mantine/core";
import { FileText, Home } from "lucide-react";
import { api } from "@/app/store";
import { useDemo } from "@/features/demo/context";
import { useWorkspace } from "@/features/workspace/context";
import { useSites } from "@/features/workspace/useSites";
import { useSeoPages } from "@/features/seo/hooks/useSeoPages";
import {
  SEO_PAGE_PARAM, SEO_SITE_PARAM, normalizePagePath, pageAddress, pageLabel, pickSeoSite, seoPageSearch,
} from "@/features/seo/lib/seoPageParams";
import { scoreTone } from "@/features/seo/components/shared/tone";
import { NavTreeLinks, type NavTreeLink } from "./NavTreeLinks";
import classes from "./FavouriteLinks.module.css";

const INITIAL_ROWS = 12;

export function SeoPageLinks({ pathname }: { pathname: string }) {
  const { search } = useLocation();
  const workspaceId = useWorkspace().active?._id ?? "";
  const { sites } = useSites(workspaceId);
  const params = new URLSearchParams(search);
  const site = pickSeoSite(sites, params.get(SEO_SITE_PARAM));
  const siteId = site?.siteId ?? "";
  const current = normalizePagePath(params.get(SEO_PAGE_PARAM));
  const { pages } = useSeoPages(workspaceId, siteId);
  const audited = useMemo(() => pages.filter((p) => p.audit), [pages]);
  const [showAll, setShowAll] = useState(false);
  const { demo } = useDemo();
  const prefetchReport = api.usePrefetch("getLatestSeoReport", { ifOlderThan: 300 });
  const domain = site ? site.domain.replace(/^https?:\/\//i, "").replace(/\/$/, "") : "";

  if (!siteId || !audited.length) return null;

  const visible = showAll ? audited : audited.slice(0, INITIAL_ROWS);
  const links: NavTreeLink[] = visible.map((p) => ({
    key: p.path,
    to: `${pathname}${seoPageSearch(search, siteId, p.path)}`,
    label: pageLabel(p.path),
    icon: p.path === "/" ? Home : FileText,
    active: p.path === current,
    onIntent: demo || p.path === current
      ? undefined
      : () => prefetchReport({ workspaceId, siteId, url: pageAddress(domain, p.path) }),
    trailing: p.audit ? (
      <span className={classes.score} data-tone={scoreTone(p.audit.score)}>{p.audit.score}</span>
    ) : undefined,
  }));

  const hidden = audited.length - visible.length;
  const footer = hidden > 0 ? (
    <UnstyledButton className={classes.more} onClick={() => setShowAll(true)}>
      Show {hidden} more
    </UnstyledButton>
  ) : null;

  return <NavTreeLinks pathname={pathname} links={links} ariaLabel="Audited pages" footer={footer} />;
}
