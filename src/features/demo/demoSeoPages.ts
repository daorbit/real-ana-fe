import type { SeoPage, SeoPageList } from "@/shared/types";
import { demoCrawl, demoSeoReport } from "./demoData";

const rootAudit = {
  reportId: demoSeoReport._id,
  score: demoSeoReport.score,
  createdAt: demoSeoReport.createdAt,
};

const crawled: SeoPage[] = demoCrawl.data.pages
  .map((p) => p.path.replace(/\/+$/, "") || "/")
  .filter((path, i, all) => all.indexOf(path) === i)
  .map((path) => ({ path, inSitemap: true, audit: path === "/" ? rootAudit : null }));

export const demoSeoPages: SeoPageList = {
  sitemap: true,
  pages: crawled.some((p) => p.path === "/")
    ? crawled
    : [{ path: "/", inSitemap: true, audit: rootAudit }, ...crawled],
};
