import { useState } from "react";
import { useCreateSiteMutation } from "@/app/store";
import { useAuth } from "@/features/auth/context";
import type { TrackerOptions } from "@/features/workspace";
import type { FrameworkId } from "@/features/workspace/frameworks";
import * as v from "@/shared/lib/validate";
import { notify, notifyError } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";
import type { Site } from "@/shared/types";
import { APP_STEPS, WEB_STEPS, type AppKind, type Platform } from "./constants";

function list(s: string): string[] {
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

export function useAddSiteForm(workspaceId: string, existingDomains: string[]) {
  const { user } = useAuth();
  const [createSite, { isLoading: creating }] = useCreateSiteMutation();

  const [step, setStep] = useState(0);
  const [platform, setPlatform] = useState<Platform>("web");
  const [appKind, setAppKind] = useState<AppKind>("mobile");

  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [bundleId, setBundleId] = useState("");
  const [framework, setFramework] = useState<FrameworkId>("html");
  const [nameError, setNameError] = useState<string | null>(null);
  const [domainError, setDomainError] = useState<string | null>(null);

  const [dnt, setDnt] = useState(false);
  const [hash, setHash] = useState(false);
  const [clicks, setClicks] = useState(true);
  const [errors, setErrors] = useState(true);
  const [ignorePages, setIgnorePages] = useState("");
  const [allowParams, setAllowParams] = useState("");
  const [reportDomain, setReportDomain] = useState("");

  const [created, setCreated] = useState<Site | null>(null);

  const options: TrackerOptions = {
    dnt,
    hash,
    clicks,
    errors,
    ignorePages: list(ignorePages),
    allowParams: list(allowParams),
    domain: reportDomain,
  };

  const steps = platform === "app" ? APP_STEPS : WEB_STEPS;
  const lastStep = steps.length - 1;

  const reset = () => {
    setStep(0);
    setPlatform("web");
    setAppKind("mobile");
    setName("");
    setDomain("");
    setBundleId("");
    setFramework("html");
    setNameError(null);
    setDomainError(null);
    setDnt(false);
    setHash(false);
    setClicks(true);
    setErrors(true);
    setIgnorePages("");
    setAllowParams("");
    setReportDomain("");
    setCreated(null);
  };

  const validateName = () => {
    const err = v.all(v.required("Name"), v.maxLength("Name", 60))(name);
    setNameError(err);
    return !err;
  };

  const validateWebIdentity = () => {
    const nameOk = validateName();
    const dErr = v.domain(domain);
    setDomainError(dErr);
    if (!nameOk || dErr) return false;
    if (existingDomains.includes(v.normalizeDomain(domain))) {
      setDomainError("A site with that domain already exists in this workspace");
      return false;
    }
    return true;
  };

  const validateAppIdentity = () => {
    const nameOk = validateName();
    if (appKind === "web") {
      const dErr = v.domain(domain);
      setDomainError(dErr);
      return nameOk && !dErr;
    }
    setDomainError(null);
    return nameOk;
  };

  const createAppSite = async () => {
    trace(user?.id, "create_site", "add_site_wizard", "app");
    try {
      const site = await createSite({
        workspaceId,
        name: name.trim(),
        platform: "app",
        domain: appKind === "web" ? v.normalizeDomain(domain) : "",
        bundleId: appKind === "mobile" ? bundleId.trim() : "",
      }).unwrap();
      setCreated(site);
      setStep(lastStep);
      notify.success(`App "${site.name}" added.`);
    } catch (err) {
      notifyError(err, "Could not add the app.");
    }
  };

  const createWebSite = async () => {
    trace(user?.id, "create_site", "add_site_wizard", "web");
    try {
      const site = await createSite({
        workspaceId,
        name: name.trim(),
        platform: "web",
        domain: v.normalizeDomain(domain),
        framework,
        trackerOptions: options,
      }).unwrap();
      setCreated(site);
      setStep(lastStep);
      notify.success(`Site "${site.name}" added.`);
    } catch (err) {
      notifyError(err, "Could not add the site.");
    }
  };

  const next = async () => {
    if (step === 0) return setStep(1);
    if (platform === "app") {
      if (step === 1 && validateAppIdentity()) await createAppSite();
      return;
    }
    if (step === 1) {
      if (validateWebIdentity()) setStep(2);
      return;
    }
    if (step === 2) await createWebSite();
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  return {
    step,
    steps,
    lastStep,
    next,
    back,
    reset,
    creating,
    created,
    platform,
    setPlatform,
    appKind,
    setAppKind,
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
    bundleId,
    setBundleId,
    framework,
    setFramework,
    options,
    tracking: {
      dnt, setDnt, hash, setHash, clicks, setClicks, errors, setErrors,
      ignorePages, setIgnorePages, allowParams, setAllowParams, reportDomain, setReportDomain,
    },
  };
}

export type AddSiteForm = ReturnType<typeof useAddSiteForm>;
