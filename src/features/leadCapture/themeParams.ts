import { hostFrameUrl } from "@/shared/lib/hostFrameUrl";

export const LEAD_FORMS_BASE =
  import.meta.env.VITE_LEAD_FORMS_URL ?? "https://forms.daorbit.in";

export function leadFormsUrl(path: string): string {
  return hostFrameUrl(LEAD_FORMS_BASE, path);
}
