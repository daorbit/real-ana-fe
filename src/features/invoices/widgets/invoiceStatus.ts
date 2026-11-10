const LABELS: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

export function invoiceStatusLabel(status: string): string {
  return LABELS[status] ?? status;
}

export function invoiceStatusTone(status: string): "good" | "bad" | undefined {
  if (status === "paid") return "good";
  if (status === "overdue") return "bad";
  return undefined;
}
