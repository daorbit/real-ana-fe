import type { InvoiceAccent, InvoiceTemplate } from "../types";

export const INVOICE_CURRENCIES = [
  { value: "INR", label: "INR, Indian rupee" },
  { value: "USD", label: "USD, US dollar" },
  { value: "EUR", label: "EUR, Euro" },
  { value: "GBP", label: "GBP, British pound" },
  { value: "AED", label: "AED, UAE dirham" },
  { value: "AUD", label: "AUD, Australian dollar" },
  { value: "CAD", label: "CAD, Canadian dollar" },
  { value: "SGD", label: "SGD, Singapore dollar" },
];

export const MAX_PAYMENT_TERMS_DAYS = 365;

export const MAX_LOGO_BYTES = 300 * 1024;

export const INVOICE_TEMPLATES: { value: InvoiceTemplate; label: string }[] = [
  { value: "classic", label: "Standard" },
  { value: "modern", label: "Spreadsheet" },
  { value: "minimal", label: "Minimalist" },
  { value: "bold", label: "Grand" },
];

export const INVOICE_ACCENTS: { value: InvoiceAccent; label: string }[] = [
  { value: "blue", label: "Blue" },
  { value: "indigo", label: "Indigo" },
  { value: "teal", label: "Teal" },
  { value: "emerald", label: "Emerald" },
  { value: "amber", label: "Amber" },
  { value: "crimson", label: "Crimson" },
  { value: "slate", label: "Slate" },
];
