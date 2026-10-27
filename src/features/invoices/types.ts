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
}

export interface InvoicingProfileResponse {
  profile: InvoicingProfile;
  complete: boolean;
}
