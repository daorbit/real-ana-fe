import { demoDrift } from "@/features/demo/demoDrift";
import type { InvoicesOverview, RecentInvoice } from "@/features/invoices/widgetTypes";

const HOUR = 3_600_000;

const RECENT: Omit<RecentInvoice, "createdAt">[] = [
  { id: "demo-inv-1048", type: "invoice", invoiceNumber: "INV-1048", billToName: "Northwind Studio", total: 42_500, currency: "INR", status: "sent" },
  { id: "demo-inv-1047", type: "invoice", invoiceNumber: "INV-1047", billToName: "Brightline Labs", total: 18_900, currency: "INR", status: "paid" },
  { id: "demo-inv-1046", type: "invoice", invoiceNumber: "INV-1046", billToName: "Kite & Co", total: 76_000, currency: "INR", status: "overdue" },
  { id: "demo-inv-1045", type: "invoice", invoiceNumber: "INV-1045", billToName: "Mosaic Foods", total: 12_400, currency: "INR", status: "paid" },
  { id: "demo-inv-1044", type: "invoice", invoiceNumber: "INV-1044", billToName: "Orbit Ventures", total: 31_250, currency: "INR", status: "draft" },
];

export function demoInvoicesOverview(): InvoicesOverview {
  const flow = demoDrift(31, 0.05);
  const paid = Math.round(384_200 * flow);
  const pending = Math.round(149_750 / flow);
  return {
    summary: {
      currency: "INR",
      invoices: { total: 48, paid: 37, unpaid: 11, recent: 9 },
      revenue: { total: paid + pending, paid, pending },
      receivables: { current: pending - 76_000, overdue: 76_000, openCount: 11, overdueCount: 2 },
    },
    recent: RECENT.map((row, i) => ({ ...row, createdAt: new Date(Date.now() - (i * 19 + 3) * HOUR).toISOString() })),
  };
}
