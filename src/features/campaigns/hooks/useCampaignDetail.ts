import { useEffect, useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useDemo } from "@/features/demo/context";
import { demoCampaign } from "@/features/demo/demoCampaigns";
import { useGetCampaignQuery } from "@/features/campaigns/api";

const SENDING_POLL_MS = 30_000;

export function useCampaignDetail(workspaceId: string | undefined, id: string | undefined) {
  const { demo } = useDemo();
  const [live, setLive] = useState(false);
  const query = useGetCampaignQuery(workspaceId && id && !demo ? { workspaceId, id } : skipToken, {
    pollingInterval: live ? SENDING_POLL_MS : 0,
    skipPollingIfUnfocused: true,
  });
  const sample = useMemo(() => (demo && id ? demoCampaign(id) : null), [demo, id]);
  const campaign = demo ? sample : (query.currentData ?? null);
  const status = campaign?.status;

  useEffect(() => {
    setLive(status === "sending" || status === "preparing");
  }, [status]);

  return {
    campaign,
    loading: !demo && query.isLoading,
    notFound: demo ? !sample : query.isError && !query.currentData,
    refetch: query.refetch,
  };
}
