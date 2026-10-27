export type InvoiceTemplate = "classic" | "modern" | "minimal" | "bold";
export type InvoiceAccent = "blue" | "indigo" | "teal" | "emerald" | "amber" | "crimson" | "slate";

export interface InvoicingProfile {
  businessName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  gstin: string;
  currency: string;
  invoicePrefix: string;
  quotationPrefix: string;
  paymentTermsDays: number;
  defaultNotes: string;
  defaultTerms: string;
  logo: string;
  defaultTemplate: InvoiceTemplate;
  accentColor: InvoiceAccent;
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  upiId: string;
}

export interface InvoicingProfileResponse {
  profile: InvoicingProfile;
  complete: boolean;
}

export type SetProfileField = <K extends keyof InvoicingProfile>(field: K, value: InvoicingProfile[K]) => void;
