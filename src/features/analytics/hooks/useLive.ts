import { useGetLiveQuery } from "@/app/store";

/**
 * Visitors online right now, refreshed on its own short cycle.
 *
 * The figure also arrives inside `useStats`, but that payload is the whole
 * dashboard and polls every two minutes. A number labelled "online now" that lags
 * that far reads as broken — a visitor arrives and the dashboard insists nobody
 * is there — so it is fetched separately and more often.
 *
 * The window itself is five minutes wide server-side, so this poll rate is
 * about how quickly the screen catches up, not about the figure's precision.
 */
export const LIVE_POLL_MS = 30_000;

export function useLive(
  workspaceId: string | undefined,
  filter?: string,
  sites?: string[],
) {
  const { data, isFetching } = useGetLiveQuery(
    { workspaceId: workspaceId!, filter, sites },
    {
      skip: !workspaceId,
      pollingInterval: LIVE_POLL_MS,
      // A backgrounded dashboard is not being read, and polling it just spends
      // the customer's ingest budget on a number nobody is looking at.
      skipPollingIfUnfocused: true,
    },
  );

  return {
    live: data?.live ?? 0,
    livePages: data?.livePages ?? [],
    liveCountries: data?.liveCountries ?? [],
    audience: data?.audience ?? null,
    isFetching,
  };
}
