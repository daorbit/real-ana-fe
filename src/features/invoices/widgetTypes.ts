export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export type InvoiceSummary = {
  currency: string;
  invoices: { total: number; paid: number; unpaid: number; recent: number };
  revenue: { total: number; paid: number; pending: number };
  receivables: { current: number; overdue: number; openCount: number; overdueCount: number };
};

export type RecentInvoice = {
  id: string;
  type: "invoice" | "quotation";
  invoiceNumber?: string;
  billToName?: string;
  total: number;
  currency: string;
  status: InvoiceStatus | string;
  createdAt: string;
};

export type InvoicesOverview = { summary: InvoiceSummary; recent: RecentInvoice[] };
