import { newRowId } from "@/features/bio/lib/bioOptions";
import { CUSTOM_SERVICE_ID, serviceById } from "@/features/bio/lib/serviceCatalog";
import type { BioServiceRow } from "@/features/bio/types";

export function newServiceRow(serviceId: string, url = "", action?: string): BioServiceRow {
  const service = serviceById(serviceId);
  return {
    id: newRowId(),
    service: service.id,
    name: service.id === CUSTOM_SERVICE_ID ? "" : service.name,
    url,
    action: action ?? service.action,
    enabled: true,
  };
}
