import { useState } from "react";
import {
  Card, Text, Title, Group, Table, Badge, Stack, ActionIcon, ThemeIcon, Tooltip,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { RefreshCw, Download, Receipt } from "lucide-react";
import { useGetInvoicesQuery } from "@/app/store";
import { useAuth } from "@/features/auth/context";
import { getToken } from "@/shared/lib/http";
import { notify } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";
import { InvoiceTableSkeleton } from "@/shared/ui/Skeletons";
import { formatMoney } from "@/shared/lib/currency";
import type { Invoice } from "@/shared/types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";


export function Receipts({ workspaceId }: { workspaceId: string }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: invoices = [], isLoading, isFetching, refetch } = useGetInvoicesQuery(
    { workspaceId },
    { skip: !workspaceId },
  );
  const [downloading, setDownloading] = useState<string | null>(null);

  const download = async (invoice: Invoice) => {
    trace(user?.id, "download_invoice_clicked", "billing_history", invoice.kind);
    setDownloading(invoice.id);
    try {
      const token = getToken();
      const res = await fetch(
        `${API_BASE}/api/billing/invoices/${invoice.kind}/${invoice.id}/pdf`,
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined },
      );
      if (!res.ok) throw new Error(`Download failed (${res.status})`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice.number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      notify.error(t("billing.downloadError"));
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div>
      <Group justify="space-between" align="center" mb="lg">
        <div>
          <Title order={3} style={{ letterSpacing: "-0.01em" }}>{t("billing.receiptsTitle")}</Title>
          <Text size="sm" c="dimmed" mt={2}>
            {t("billing.receiptsSubtitle")}
          </Text>
        </div>
        {/* A receipt appears only once the webhook has credited the payment,
            which can land a moment after checkout closes — so the first thing
            someone does when a just-bought receipt is missing is look for this. */}
        <Tooltip label={t("billing.refetchReceipts")}>
          <ActionIcon
            variant="light"
            color="gray"
            size="lg"
            radius="md"
            loading={isFetching}
            onClick={() => refetch()}
          >
            <RefreshCw size={15} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Card withBorder radius="lg" padding={0} style={{ overflow: "hidden" }}>
        {isLoading ? (
          <InvoiceTableSkeleton />
        ) : !invoices.length ? (
          <Stack align="center" gap={6} py={40} px="md">
            <ThemeIcon size={42} radius="xl" variant="light" color="gray">
              <Receipt size={20} />
            </ThemeIcon>
            <Text size="sm" c="dimmed" ta="center" maw={340}>
              {t("billing.noReceipts")}
            </Text>
          </Stack>
        ) : (
          <Table.ScrollContainer minWidth={560}>
            <Table verticalSpacing="sm" horizontalSpacing="lg">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t("billing.colReceipt")}</Table.Th>
                  <Table.Th>{t("billing.colDate")}</Table.Th>
                  <Table.Th>{t("billing.colItem")}</Table.Th>
                  <Table.Th ta="right">{t("billing.colAmount")}</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {invoices.map((inv) => (
                  <Table.Tr key={`${inv.kind}-${inv.id}`}>
                    <Table.Td>
                      <Text size="sm" fw={600} ff="monospace">{inv.number}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {new Date(inv.issuedAt).toLocaleDateString(undefined, {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={8} wrap="nowrap">
                        <Badge size="sm" variant="light" color={inv.kind === "plan" ? "emerald" : "gray"} tt="none">
                          {inv.kind === "plan" ? t("billing.kindPlan") : t("billing.kindAddon")}
                        </Badge>
                        <Text size="sm">{inv.description}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text size="sm" fw={650}>{formatMoney(inv.amount, inv.currency)}</Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Tooltip label={t("billing.downloadPdf")}>
                        <ActionIcon
                          variant="light"
                          color="gray"
                          radius="md"
                          loading={downloading === inv.id}
                          onClick={() => download(inv)}
                        >
                          <Download size={15} />
                        </ActionIcon>
                      </Tooltip>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>

      <Text size="xs" c="dimmed" mt="sm">
        {t("billing.notTaxInvoices")}
      </Text>
    </div>
  );
}
