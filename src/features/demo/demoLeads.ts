import { demoDrift } from "@/features/demo/demoDrift";
import type { LeadPipeline } from "@/features/leadCapture/types";

const DAY = 86_400_000;

const FORMS = [
  { formId: "demo-form-demo", name: "Book a demo", base: 64 },
  { formId: "demo-form-pricing", name: "Pricing enquiry", base: 41 },
  { formId: "demo-form-newsletter", name: "Newsletter signup", base: 27 },
  { formId: "demo-form-contact", name: "Contact us", base: 18 },
];

export function demoLeadPipeline(): LeadPipeline {
  const topForms = FORMS.map((f, i) => ({
    formId: f.formId,
    name: f.name,
    leads: Math.round(f.base * demoDrift(20 + i, 0.08)),
  }));
  const total = topForms.reduce((sum, f) => sum + f.leads, 0);
  const won = Math.round(total * 0.14);
  const lost = Math.round(total * 0.09);
  const qualified = Math.round(total * 0.21);
  const contacted = Math.round(total * 0.26);
  return {
    window: { since: new Date(Date.now() - 30 * DAY).toISOString(), until: new Date().toISOString() },
    total,
    byStage: { new: total - won - lost - qualified - contacted, contacted, qualified, won, lost },
    averageLeadScore: 68.4,
    scoredLeads: Math.round(total * 0.8),
    topForms,
  };
}
