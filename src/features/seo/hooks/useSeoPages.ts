import { useGetSeoPagesQuery } from "@/app/store";
import { useDemo } from "@/features/demo/context";
import { demoSeoPages } from "@/features/demo/demoSeoPages";
import type { SeoPage } from "@/shared/types";

const EMPTY: SeoPage[] = [];

export function useSeoPages(workspaceId: string, siteId: string) {
  const { demo } = useDemo();
  const args = { workspaceId, siteId };
  const { currentData, data, originalArgs, isLoading, isError } = useGetSeoPagesQuery(args, {
    skip: demo || !workspaceId || !siteId,
  });

  if (demo) return { pages: demoSeoPages.pages, sitemap: demoSeoPages.sitemap, loading: false, failed: false };

  const sameArgs = originalArgs?.workspaceId === workspaceId && originalArgs?.siteId === siteId;
  const list = currentData ?? (sameArgs ? data : undefined);
  return {
    pages: list?.pages ?? EMPTY,
    sitemap: list?.sitemap ?? false,
    loading: isLoading,
    failed: isError,
  };
}
