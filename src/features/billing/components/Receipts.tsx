import { useTranslation } from "react-i18next";
import { Receipt } from "lucide-react";
import { useGetInvoicesQuery } from "@/app/store";
import { useReceiptDownload } from "../hooks/useReceiptDownload";
import { SectionHeader } from "./common/SectionHeader";
import { RefetchButton } from "./common/RefetchButton";
import { ReceiptRow } from "./receipts/ReceiptRow";
import { ReceiptStats } from "./receipts/ReceiptStats";
import { ReceiptsSkeleton } from "./receipts/ReceiptsSkeleton";
import classes from "./receipts/Receipts.module.css";

export function Receipts({ workspaceId }: { workspaceId: string }) {
  const { t } = useTranslation();
  const { data: invoices = [], isLoading, isFetching, refetch } = useGetInvoicesQuery(
    { workspaceId },
    { skip: !workspaceId },
  );
  const { download, downloading } = useReceiptDownload();

  const body = isLoading ? (
    <ReceiptsSkeleton />
  ) : !invoices.length ? (
    <div className={classes.list}>
      <div className={classes.empty}>
        <span className={classes.emptyIcon}>
          <Receipt size={22} />
        </span>
        <p className={classes.emptyTitle}>{t("billing.noReceiptsTitle", "No payments yet")}</p>
        <p className={classes.emptyText}>{t("billing.noReceipts")}</p>
      </div>
    </div>
  ) : (
    <>
      <ReceiptStats invoices={invoices} />
      <div className={classes.list}>
        <div className={`${classes.row} ${classes.headRow}`}>
          <span>{t("billing.colItem")}</span>
          <span>{t("billing.colDate")}</span>
          <span className={classes.amount}>{t("billing.colAmount")}</span>
          <span />
        </div>
        {invoices.map((inv) => (
          <ReceiptRow
            key={`${inv.kind}-${inv.id}`}
            invoice={inv}
            downloading={downloading === inv.id}
            onDownload={download}
          />
        ))}
      </div>
    </>
  );

  return (
    <div>
      <SectionHeader
        title={t("billing.receiptsTitle")}
        description={t("billing.receiptsSubtitle")}
        actions={<RefetchButton label={t("billing.refetchReceipts")} loading={isFetching} onClick={() => refetch()} />}
      />
      {body}
      <p className={classes.note}>{t("billing.notTaxInvoices")}</p>
    </div>
  );
}
