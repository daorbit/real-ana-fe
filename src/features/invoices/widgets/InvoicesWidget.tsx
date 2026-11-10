import { useMemo } from "react";
import { ReceiptText } from "lucide-react";
import { useDemo } from "@/features/demo/context";
import { demoInvoicesOverview } from "@/features/demo/demoInvoices";
import { useDemoTick } from "@/features/demo/useDemoTick";
import { usePermissions } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { QuantalogAppOffCard } from "@/features/integrations/components/QuantalogAppOffCard";
import { HomeWidgetCard, WidgetEmpty, WidgetList, WidgetRow, WidgetStat, WidgetStats } from "@/shared/ui/HomeWidgetCard";
import { ChartSkeleton } from "@/shared/ui/Skeletons";
import { timeAgo } from "@/shared/lib";
import { INVOICES_APP_BASE } from "@/features/invoices/lib/invoicesApp";
import { invoiceMoney } from "@/features/invoices/lib/invoiceMoney";
import { useGetInvoicesOverviewQuery } from "@/features/invoices/api";
import { invoiceStatusLabel, invoiceStatusTone } from "@/features/invoices/widgets/invoiceStatus";

export function InvoicesWidget({ workspaceId }: { workspaceId: string }) {
  const { demo } = useDemo();
  const { invoicing: on } = useWorkspaceApps();
  const { canEdit } = usePermissions();
  const tick = useDemoTick(demo);
  const sample = useMemo(() => (demo && tick >= 0 ? demoInvoicesOverview() : null), [demo, tick]);
  const ready = on && Boolean(INVOICES_APP_BASE) && canEdit && !demo;
  const { currentData, isLoading, isError } = useGetInvoicesOverviewQuery(workspaceId, { skip: !ready });
  const data = sample ?? currentData;

  if (!demo && (!on || !INVOICES_APP_BASE)) return <QuantalogAppOffCard app="invoicing" to="/app/invoices" />;

  return (
    <HomeWidgetCard icon={ReceiptText} title="Invoices" meta={data ? `${data.summary.invoices.unpaid} unpaid` : undefined} to="/app/invoices">
      {!demo && !canEdit ? (
        <WidgetEmpty>Editors and admins can see invoices here.</WidgetEmpty>
      ) : isLoading && !data ? (
        <ChartSkeleton height={140} />
      ) : isError || !data ? (
        <WidgetEmpty>Invoices couldn't load right now.</WidgetEmpty>
      ) : (
        <>
          <WidgetStats>
            <WidgetStat label="Paid" value={invoiceMoney(data.summary.revenue.paid, data.summary.currency)} tone="good" />
            <WidgetStat label="Pending" value={invoiceMoney(data.summary.revenue.pending, data.summary.currency)} />
            <WidgetStat
              label="Overdue"
              value={invoiceMoney(data.summary.receivables.overdue, data.summary.currency)}
              tone={data.summary.receivables.overdue > 0 ? "bad" : undefined}
            />
          </WidgetStats>
          {data.recent.length === 0 ? (
            <WidgetEmpty>Your newest invoices show up here.</WidgetEmpty>
          ) : (
            <WidgetList>
              {data.recent.map((row) => (
                <WidgetRow
                  key={row.id}
                  title={row.billToName || "No client"}
                  sub={`${row.invoiceNumber ?? "Invoice"} · ${invoiceStatusLabel(row.status)} · ${timeAgo(row.createdAt)}`}
                  end={invoiceMoney(row.total, row.currency)}
                  endTone={invoiceStatusTone(row.status)}
                />
              ))}
            </WidgetList>
          )}
        </>
      )}
    </HomeWidgetCard>
  );
}
