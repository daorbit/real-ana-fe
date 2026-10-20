import { FrameworkPicker } from "@/features/workspace/components/FrameworkPicker";
import type { AddSiteForm } from "./useAddSiteForm";

export function FrameworkStep({ form }: { form: AddSiteForm }) {
  return <FrameworkPicker value={form.framework} onChange={form.setFramework} />;
}
