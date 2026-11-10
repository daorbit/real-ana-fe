export function invoiceMoney(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      notation: Math.abs(value) >= 100_000 ? "compact" : "standard",
      maximumFractionDigits: Math.abs(value) >= 1_000 ? 0 : 2,
    }).format(value);
  } catch {
    return `${currency} ${Math.round(value).toLocaleString()}`;
  }
}
