import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getToken } from "@/shared/lib/http";
import { notify } from "@/shared/lib/notify";
import type { Invoice } from "@/shared/types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export function useReceiptDownload() {
  const { t } = useTranslation();
  const [downloading, setDownloading] = useState<string | null>(null);

  const download = async (invoice: Invoice) => {
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

  return { download, downloading };
}
