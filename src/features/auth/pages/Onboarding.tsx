import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Group, Text, Anchor, Badge } from "@mantine/core";
import { OnboardingBrand } from "@/features/auth/components/OnboardingBrand";
import { ProfileStep } from "@/features/auth/components/ProfileStep";
import { AppearanceStep } from "@/features/auth/components/onboarding/AppearanceStep";
import { WorkspaceStepBody, WorkspaceStepFooter } from "@/features/auth/components/onboarding/WorkspaceStep";
import { SiteStepBody, SiteStepFooter } from "@/features/auth/components/onboarding/SiteStep";
import { ReadyStepBody, ReadyStepFooter } from "@/features/auth/components/onboarding/ReadyStep";
import { useCreateWorkspaceMutation, useCreateSiteMutation, useGenerateOnboardingCopyMutation } from "@/app/store";
import { useWorkspace } from "@/features/workspace/context";
import { getFramework } from "@/features/workspace/frameworks";
import type { FrameworkId } from "@/features/workspace/frameworks";
import * as v from "@/shared/lib/validate";
import { notifyError } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";
import { useAuth } from "@/features/auth/context";
import type { Site } from "@/shared/types";
 
const STEPS = [
  { label: "Your details", hint: "Name, mobile and photo" },
  { label: "Workspace", hint: "Where your sites live" },
  { label: "Your site", hint: "What you want to track" },
  { label: "Install", hint: "One script tag" },
];


const WORKSPACE_ONLY_STEPS = [
  { label: "Workspace", hint: "Where your sites live" },
  { label: "Your site", hint: "What you want to track" },
  { label: "Install", hint: "One script tag" },
];

 
const FIRST_SKIPPABLE_STEP = 1;

 
export default function Onboarding() {
  const nav = useNavigate();
  const { setActive, workspaces } = useWorkspace();
  const { user } = useAuth();
  const [params] = useSearchParams();

 
  const workspaceOnly = params.get("mode") === "workspace";

  const [step, setStep] = useState(workspaceOnly ? 1 : 0);
  const [createWorkspace, { isLoading: creatingWs }] = useCreateWorkspaceMutation();
  const [createSite, { isLoading: creatingSite }] = useCreateSiteMutation();
  const [generateOnboardingCopy] = useGenerateOnboardingCopyMutation();

  // step 1
  const [wsName, setWsName] = useState("");
  const [wsId, setWsId] = useState<string | null>(null);
  const [wsError, setWsError] = useState<string | null>(null);

  // step 2
  const [siteName, setSiteName] = useState("");
  const [domain, setDomain] = useState("");
  const [framework, setFramework] = useState<FrameworkId>("html");
  const [purpose, setPurpose] = useState("");
  const [siteError, setSiteError] = useState<string | null>(null);
  const [domainError, setDomainError] = useState<string | null>(null);

  // step 3
  const [site, setSite] = useState<Site | null>(null);
  const [aiCopy, setAiCopy] = useState<{ readyHeadline: string; readyDescription: string } | null>(null);

  const guide = getFramework(framework);

  /**
   * Leave setup early. The flag is what stops the route guard sending an
   * account with no workspace straight back here — without it, "Skip for now"
   * would be a no-op loop.
   */
  const skip = () => {
    trace(user?.id, "onboarding_skipped", "onboarding", "app");
    localStorage.setItem("quantalog_onboarding_skipped", "1");
    nav(workspaceOnly ? "/app/workspaces" : "/app");
  };

  /** Finished properly — the account has a workspace, so the guard passes. */
  const done = () => {
    localStorage.removeItem("quantalog_onboarding_skipped");
    nav(workspaceOnly ? "/app/workspaces" : "/app");
  };

  const submitWorkspace = async () => {
    const err = v.all(
      v.required("Workspace name"),
      v.maxLength("Workspace name", 60),
    )(wsName);
    setWsError(err);
    if (err) return;

    trace(user?.id, "onboarding_workspace_created", "onboarding", "workspace");
    try {
      const ws = await createWorkspace({ name: wsName.trim() }).unwrap();
      setWsId(ws._id);
      setActive(ws._id);
      setStep(2);
    } catch (e) {
      notifyError(e, "Could not create the workspace.");
    }
  };

  const submitSite = async () => {
    const nErr = v.all(v.required("Site name"), v.maxLength("Site name", 60))(siteName);
    const dErr = v.domain(domain);
    setSiteError(nErr);
    setDomainError(dErr);
    if (nErr || dErr || !wsId) return;

    trace(user?.id, "onboarding_site_created", "onboarding", "site");
    try {
      const created = await createSite({
        workspaceId: wsId,
        name: siteName.trim(),
        domain: v.normalizeDomain(domain),
        framework,
        purpose: purpose.trim(),
      }).unwrap();
      setSite(created);
      setStep(3);


      if (purpose.trim()) {
        generateOnboardingCopy({
          workspaceId: wsId,
          siteName: siteName.trim(),
          domain: v.normalizeDomain(domain),
          framework,
          purpose: purpose.trim(),
        })
          .unwrap()
          .then(setAiCopy)
          .catch((e) => console.error("[onboarding-ai] copy generation failed:", e));
      }
    } catch (e) {
      notifyError(e, "Could not add the site.");
    }
  };


  const displaySteps = workspaceOnly ? WORKSPACE_ONLY_STEPS : STEPS;
  const displayStep = workspaceOnly ? step - 1 : step;

  if (step === 4) {
    return <AppearanceStep onBack={() => setStep(3)} onDone={done} />;
  }

  const footer =
    step === 1 ? (
      <WorkspaceStepFooter loading={creatingWs} onSubmit={submitWorkspace} />
    ) : step === 2 ? (
      <SiteStepFooter loading={creatingSite} onBack={() => setStep(1)} onSubmit={submitSite} />
    ) : step === 3 && site ? (
      <ReadyStepFooter onContinue={() => setStep(4)} />
    ) : null;

  return (
    <div className="auth-split onb-split">
      <OnboardingBrand step={displayStep} steps={displaySteps} />

      <div className="onb-panel">
        <div className="onb-col">
          <Group justify="space-between" mb="xl" wrap="nowrap" className="onb-head">
            <Text size="xs" c="dimmed" fw={600} style={{ letterSpacing: "0.06em" }}>
              STEP {displayStep + 1} OF {displaySteps.length}
            </Text>
            {step >= FIRST_SKIPPABLE_STEP && step < STEPS.length - 1 && (
              <Anchor component="button" type="button" c="dimmed" size="sm" onClick={skip}>
                Skip for now
              </Anchor>
            )}
          </Group>

          <div className="onb-main">
          <div className="onb-body">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                {/* An existing account sent back here only for its missing mobile
                    already has a workspace — walking it through setup again would
                    ask it to create a second one. */}
                {step === 0 && (
                  <ProfileStep onDone={() => (workspaces.length ? done() : setStep(1))} />
                )}

                {step === 1 && (
                  <WorkspaceStepBody
                    wsName={wsName}
                    wsError={wsError}
                    onChange={(v) => {
                      setWsName(v);
                      setWsError(null);
                    }}
                    onSubmit={submitWorkspace}
                  />
                )}

                {step === 2 && (
                  <SiteStepBody
                    siteName={siteName}
                    siteError={siteError}
                    onSiteNameChange={(v) => {
                      setSiteName(v);
                      setSiteError(null);
                    }}
                    domain={domain}
                    domainError={domainError}
                    onDomainChange={(v) => {
                      setDomain(v);
                      setDomainError(null);
                    }}
                    purpose={purpose}
                    onPurposeChange={setPurpose}
                    framework={framework}
                    onFrameworkChange={setFramework}
                  />
                )}

                {step === 3 && site && (
                  <ReadyStepBody
                    site={site}
                    framework={framework}
                    guide={guide}
                    aiCopy={aiCopy}
                    workspaceId={wsId}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            <Group justify="center" gap="lg" mt={40} wrap="wrap">
              {["Under 1 KB", "No cookies", "No consent banner"].map((t) => (
                <Badge key={t} variant="light" color="gray" size="sm" radius="sm">
                  {t}
                </Badge>
              ))}
            </Group>
          </div>

          {footer && <div className="onb-foot">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
