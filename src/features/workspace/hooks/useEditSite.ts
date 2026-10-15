import { useEffect, useState } from "react";
import { useUpdateSiteMutation } from "@/app/store";
import { useAuth } from "@/features/auth/context";
import { notify, notifyError } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";
import * as v from "@/shared/lib/validate";
import type { Site } from "@/shared/types";

export function useEditSite(workspaceId: string, site: Site | null, sites: Site[]) {
  const { user } = useAuth();
  const [updateSite, { isLoading: saving }] = useUpdateSiteMutation();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [domainError, setDomainError] = useState<string | null>(null);

  const isWeb = site?.platform !== "app";

  useEffect(() => {
    setName(site?.name ?? "");
    setDomain(site?.domain ?? "");
    setNameError(null);
    setDomainError(null);
  }, [site]);

  const validate = () => {
    const nErr = v.all(v.required("Name"), v.maxLength("Name", 60))(name);
    let dErr = isWeb || domain.trim() ? v.domain(domain) : null;
    if (!dErr && site) {
      const next = v.normalizeDomain(domain);
      const taken = next && sites.some((s) => s.siteId !== site.siteId && s.domain === next);
      if (taken) dErr = "A site with that domain already exists in this workspace";
    }
    setNameError(nErr);
    setDomainError(dErr);
    return !nErr && !dErr;
  };

  const save = async (): Promise<boolean> => {
    if (!site || !validate()) return false;
    const nextName = name.trim();
    const nextDomain = v.normalizeDomain(domain);
    if (nextName === site.name && nextDomain === site.domain) return true;
    trace(user?.id, "edit_site", "workspaces", "workspaces");
    try {
      await updateSite({ workspaceId, siteId: site.siteId, name: nextName, domain: nextDomain }).unwrap();
      notify.success(`Site "${nextName}" updated.`);
      return true;
    } catch (err) {
      notifyError(err, "Could not update the site.");
      return false;
    }
  };

  return {
    name,
    setName: (value: string) => {
      setName(value);
      setNameError(null);
    },
    nameError,
    domain,
    setDomain: (value: string) => {
      setDomain(value);
      setDomainError(null);
    },
    domainError,
    domainChanged: Boolean(site?.domain) && v.normalizeDomain(domain) !== site?.domain,
    saving,
    save,
  };
}
