export const LEAD_STAGES = ["new", "contacted", "qualified", "won", "lost"] as const;

export type LeadStage = (typeof LEAD_STAGES)[number];

export type LeadPipeline = {
  window: { since: string; until: string };
  total: number;
  byStage: Record<LeadStage, number>;
  averageLeadScore: number | null;
  scoredLeads: number;
  topForms: { formId: string; name: string; leads: number }[];
};
