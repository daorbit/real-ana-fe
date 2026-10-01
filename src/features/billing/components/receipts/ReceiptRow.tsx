import { ActionIcon, Tooltip } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Download, Layers, ShoppingCart } from "lucide-react";
import { formatMoney } from "@/shared/lib/currency";
import type { Invoice } from "@/shared/types";
import classes from "./Receipts.module.css";

export function ReceiptRow({
  invoice,
  downloading,
  onDownload,
}: {
  invoice: Invoice;
  downloading: boolean;
  onDownload: (invoice: Invoice) => void;
}) {
  const { t } = useTranslation();
  const KindIcon = invoice.kind === "plan" ? Layers : ShoppingCart;

  return (
    <div className={classes.row}>
      <div className={classes.item}>
        <span className={classes.kindIcon} data-kind={invoice.kind}>
          <KindIcon size={17} />
        </span>
        <div className={classes.itemText}>
          <div className={classes.description}>{invoice.description}</div>
          <div className={classes.number}>
            {invoice.number}
            <span className={classes.kindPill}>
              {invoice.kind === "plan" ? t("billing.kindPlan") : t("billing.kindAddon")}
            </span>
          </div>
        </div>
      </div>

      <span className={classes.date}>
        {new Date(invoice.issuedAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
      </span>

      <span className={classes.amount}>{formatMoney(invoice.amount, invoice.currency)}</span>

      <span className={classes.download}>
        <Tooltip label={t("billing.downloadPdf")}>
          <ActionIcon
            variant="default"
            radius="md"
            size={34}
            loading={downloading}
            onClick={() => onDownload(invoice)}
            aria-label={t("billing.downloadPdf")}
          >
            <Download size={15} />
          </ActionIcon>
        </Tooltip>
      </span>
    </div>
  );
}
