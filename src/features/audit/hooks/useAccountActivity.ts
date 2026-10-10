import { useState } from "react";
import { useGetAccountActivityQuery } from "@/app/store";

const REFRESH_AFTER_S = 30;

export function useAccountActivity() {
  const [cursor, setCursor] = useState<string | null>(null);
  const { data, isFetching, isError, refetch } = useGetAccountActivityQuery(
    { cursor },
    { refetchOnMountOrArgChange: REFRESH_AFTER_S },
  );

  return {
    items: data?.items ?? [],
    hasMore: Boolean(data?.nextCursor),
    loading: !data && !isError,
    loadingMore: Boolean(cursor) && isFetching,
    failed: !data && isError,
    loadMore: () => {
      if (data?.nextCursor) setCursor(data.nextCursor);
    },
    retry: () => {
      if (cursor) setCursor(null);
      else void refetch();
    },
  };
}
