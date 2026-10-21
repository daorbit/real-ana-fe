import { Button, Text, Tooltip } from "@mantine/core";
import { RefreshCw } from "lucide-react";
import { useGetAdminFxQuery, useSyncAdminPlanCurrencyMutation } from "@/app/store";
import { notify, errMessage } from "@/shared/lib/notify";
import { relativeTime } from "./billingFormat";

export function CurrencySync() {
  const { data: fx } = useGetAdminFxQuery();
  const [sync, { isLoading: syncing }] = useSyncAdminPlanCurrencyMutation();

  const run = async () => {
    try {
      const result = await sync().unwrap();
      const rate = result.snapshot.rates.USD;
      notify.success(
        rate ? `Repriced at 1 ${result.base} = ${rate.toFixed(4)} USD.` : "Prices repriced.",
        "USD prices updated",
      );
    } catch (e) {
      notify.error(errMessage(e, "Could not fetch the exchange rate. Prices are unchanged."));
    }
  };

  const rate = fx?.snapshot?.rates.USD;

  return (
    <>
      <Text size="xs" c="dimmed">
        {fx && !fx.configured
          ? "Exchange rate API key not configured"
          : rate && fx?.snapshot
            ? `1 ${fx.base} = $${rate.toFixed(4)} · ${relativeTime(fx.snapshot.fetchedAt)}`
            : "USD prices never synced"}
      </Text>
      <Tooltip label="Recompute USD prices from the INR price at today's rate">
        <Button
          size="sm"
          variant="default"
          radius="md"
          loading={syncing}
          disabled={fx ? !fx.configured : false}
          leftSection={<RefreshCw size={14} />}
          onClick={run}
        >
          Sync USD prices
        </Button>
      </Tooltip>
    </>
  );
}
