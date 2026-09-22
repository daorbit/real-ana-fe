import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Anchor } from "@mantine/core";
import { Wordmark } from "@/shared/ui/Brand";
import { ProfileStep } from "@/features/auth/components/ProfileStep";
import { AppearanceStep } from "@/features/auth/components/onboarding/AppearanceStep";
import { Stepper } from "@/features/auth/components/onboarding/Stepper";
import { ReferralStepBody, ReferralStepFooter } from "@/features/auth/components/onboarding/ReferralStep";
import { WorkspaceStepBody, WorkspaceStepFooter } from "@/features/auth/components/onboarding/WorkspaceStep";
import { SiteStepBody, SiteStepFooter } from "@/features/auth/components/onboarding/SiteStep";
import { FrameworkStepBody, FrameworkStepFooter } from "@/features/auth/components/onboarding/FrameworkStep";
import { ReadyStepBody, ReadyStepFooter } from "@/features/auth/components/onboarding/ReadyStep";
import { useCreateWorkspaceMutation, useCreateSiteMutation, useGenerateOnboardingCopyMutation } from "@/app/store";
import { useWorkspace } from "@/features/workspace/context";
import { getFramework } from "@/features/workspace/frameworks";
import type { FrameworkId } from "@/features/workspace/frameworks";
import * as v from "@/shared/lib/validate";
import { notifyError } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";
import { useAuth } from "@/features/auth/context";
import type { ReferralSource, Site } from "@/shared/types";
import { WELCOME_PENDING_KEY } from "@/shared/ui/WelcomeOverlay";
import s from "@/features/auth/components/onboarding/Onboarding.module.css";

const STEPS = [
  {
    label: "Your details",
    hint: "Name, mobile and photo",
    title: "Tell us who you are",
    lede: "This is the name your teammates see on reports and comments.",
  },
  {
    label: "About you",
    hint: "How you found us",
    title: "How did you hear about us?",
    lede: "Pick everything that applies — it helps us know where to focus.",
  },
  {
    label: "Workspace",
    hint: "Where your work lives",
    title: "Name your workspace",
    lede: "A workspace holds your sites, forms and reports together — usually your company, or one client.",
  },
  {
    label: "Your site",
    hint: "What Quantalog watches",
    title: "Add your first site",
    lede: "The site Quantalog watches — its traffic, its SEO, and where your forms get embedded.",
  },
  {
    label: "Built with",
    hint: "For the install snippet",
    title: "What's it built with?",
    lede: "Only changes the install snippet you get next — pick the closest match.",
    wide: true,
    /** Taller than the viewport: it scrolls, so its footer sticks. */
    tall: true,
  },
  {
    label: "Install",
    hint: "One script tag",
    title: "You're ready",
    lede: "Add this to your site and the numbers start arriving.",
    wide: true,
  },
];

const REFERRAL_STEP = 1;
const WORKSPACE_STEP = 2;
const SITE_STEP = 3;
const FRAMEWORK_STEP = 4;
const INSTALL_STEP = 5;

/** Index into `STEPS` of the first step that may be skipped. */
const FIRST_SKIPPABLE_STEP = 1;

/** The appearance screen, which sits past the stepper and runs its own layout. */
const APPEARANCE_STEP = 6;


const SLUGS = ["details", "referral", "workspace", "site", "framework", "install", "appearance"];


function furthestReachable(step: number, wsId: string | null, site: Site | null): number {
  if (step >= FRAMEWORK_STEP && !site) return wsId ? SITE_STEP : WORKSPACE_STEP;
  if (step >= WORKSPACE_STEP && !wsId) return WORKSPACE_STEP;
  return step;
}

/** What the flow keeps across a reload. Cleared once setup is finished. */
const PROGRESS_KEY = "quantalog_onboarding_progress";

type Progress = { wsId: string | null; site: Site | null };

function readProgress(): Progress {
  try {
    const raw = sessionStorage.getItem(PROGRESS_KEY);
    if (raw) return JSON.parse(raw) as Progress;
  } catch {
    // A malformed or unreadable entry is the same as no entry: the flow falls
    // back to a step whose data it does have.
  }
  return { wsId: null, site: null };
}

export default function Onboarding() {
  const nav = useNavigate();
  const { setActive, workspaces } = useWorkspace();
  const { user, updateProfile } = useAuth();
  const [params] = useSearchParams();


  const workspaceOnly = params.get("mode") === "workspace";

  // Seeded once: the flow owns its progress from here, and re-reading storage
  // on every render would fight the state it sets.
  const [restored] = useState(readProgress);


  const slugStep = SLUGS.indexOf(params.get("step") ?? "");
  const urlStep = slugStep >= 0 ? slugStep : workspaceOnly ? WORKSPACE_STEP : 0;

  const setStep = (next: number) => {
    const search = new URLSearchParams(params);
    search.set("step", SLUGS[next] ?? SLUGS[0]);
    nav({ search: search.toString() }, { replace: true });
  };
  const [createWorkspace, { isLoading: creatingWs }] = useCreateWorkspaceMutation();
  const [createSite, { isLoading: creatingSite }] = useCreateSiteMutation();
  const [generateOnboardingCopy] = useGenerateOnboardingCopyMutation();

  // step 1 (referral)
  const [referralSources, setReferralSources] = useState<ReferralSource[]>([]);

  // step 2 (workspace)
  const [wsName, setWsName] = useState("");
  const [wsId, setWsId] = useState<string | null>(restored.wsId);
  const [wsError, setWsError] = useState<string | null>(null);

  // steps 3-4 (site, framework)
  const [siteName, setSiteName] = useState("");
  const [domain, setDomain] = useState("");
  const [framework, setFramework] = useState<FrameworkId>("html");
  const [purpose, setPurpose] = useState("");
  const [siteError, setSiteError] = useState<string | null>(null);
  const [domainError, setDomainError] = useState<string | null>(null);

  // step 5 (install)
  const [site, setSite] = useState<Site | null>(restored.site);
  const [aiCopy, setAiCopy] = useState<{ readyHeadline: string; readyDescription: string } | null>(null);

  const step = furthestReachable(urlStep, wsId, site);

  const guide = getFramework(framework);

  useEffect(() => {
    try {
      sessionStorage.setItem(PROGRESS_KEY, JSON.stringify({ wsId, site }));
    } catch {
      // Storage being unavailable costs a reload its place, nothing more.
    }
  }, [wsId, site]);


  useEffect(() => {
    if (params.get("step")) return;
    const search = new URLSearchParams(params);
    search.set("step", SLUGS[step] ?? SLUGS[0]);
    nav({ search: search.toString() }, { replace: true });
    // `params` is the dependency that matters; `step` is derived from it.
  }, [params, step, nav]);

  /** Setup is over, one way or another — the scaffolding goes with it. */
  const clearProgress = () => {
    try {
      sessionStorage.removeItem(PROGRESS_KEY);
    } catch {
      // Nothing to do: the entry expires with the tab regardless.
    }
  };

  /**
   * Leave setup early. The flag is what stops the route guard sending an
   * account with no workspace straight back here — without it, "Skip for now"
   * would be a no-op loop.
   */
  const skip = () => {
    trace(user?.id, "onboarding_skipped", "onboarding", "app");
    localStorage.setItem("quantalog_onboarding_skipped", "1");
    clearProgress();
    nav(workspaceOnly ? "/app/workspaces" : "/app");
  };

  /** Finished properly — the account has a workspace, so the guard passes. */
  const done = () => {
    localStorage.removeItem("quantalog_onboarding_skipped");
    // Only a first-time signup gets the welcome animation on landing — this
    // flow also runs for an existing account adding a second workspace
    // (`workspaceOnly`), which has already seen it once.
    if (!workspaceOnly) localStorage.setItem(WELCOME_PENDING_KEY, "1");
    clearProgress();
    nav(workspaceOnly ? "/app/workspaces" : "/app");
  };

  const submitReferral = async () => {
    trace(user?.id, "onboarding_referral_saved", "onboarding", "referral");
    try {
      if (referralSources.length) await updateProfile({ referralSources });
    } catch {
      // Not worth blocking setup over — the account still gets everything
      // else it needs regardless of whether this saved.
    }
    setStep(WORKSPACE_STEP);
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
      setStep(SITE_STEP);
    } catch (e) {
      notifyError(e, "Could not create the workspace.");
    }
  };

  const submitSiteDetails = () => {
    const nErr = v.all(v.required("Site name"), v.maxLength("Site name", 60))(siteName);
    const dErr = v.domain(domain);
    setSiteError(nErr);
    setDomainError(dErr);
    if (nErr || dErr) return;
    setStep(FRAMEWORK_STEP);
  };

  const submitFramework = async () => {
    if (!wsId) return;

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
      setStep(INSTALL_STEP);

      // Best-effort: a tailored headline is a nicety, and the step is already
      // on screen and usable without it.
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

  // The appearance step runs its own full-width layout and sits past the
  // stepper, so it returns before any of the shell below is built.
  if (step === APPEARANCE_STEP) {
    return <AppearanceStep onBack={() => setStep(INSTALL_STEP)} onDone={done} />;
  }

  /**
   * What the stepper shows. An account adding another workspace skips its
   * own details step, so that comes out of the list as well as out of the
   * flow — a stepper promising a step that never arrives is worse than one
   * step shorter.
   */
  const displaySteps = workspaceOnly
    ? STEPS.filter((_, i) => i !== 0 && i !== REFERRAL_STEP)
    : STEPS;
  const displayStep = workspaceOnly
    ? STEPS.slice(0, step).filter((_, i) => i !== 0 && i !== REFERRAL_STEP).length
    : step;
  const current = STEPS[step];
  const wide = current?.wide;
  const tall = current?.tall;

  const footer =
    step === REFERRAL_STEP ? (
      <ReferralStepFooter onSkip={submitReferral} onSubmit={submitReferral} />
    ) : step === WORKSPACE_STEP ? (
      <WorkspaceStepFooter loading={creatingWs} onSubmit={submitWorkspace} />
    ) : step === SITE_STEP ? (
      <SiteStepFooter onBack={() => setStep(WORKSPACE_STEP)} onSubmit={submitSiteDetails} />
    ) : step === FRAMEWORK_STEP ? (
      <FrameworkStepFooter loading={creatingSite} onBack={() => setStep(SITE_STEP)} onSubmit={submitFramework} />
    ) : step === INSTALL_STEP && site ? (
      <ReadyStepFooter onContinue={() => setStep(APPEARANCE_STEP)} />
    ) : null;

  return (
    <div className={`${s.shell} onb-form`}>
      <header className={s.bar}>
        <Wordmark />
        <Stepper step={displayStep} steps={displaySteps} />
        <div className={s.barEnd}>
          {/* Only an existing account adding a second workspace may bail out
              early — a brand-new signup has nothing to fall back to yet, so
              skipping would just strand it without a workspace or a site. */}
          {workspaceOnly && step >= FIRST_SKIPPABLE_STEP && step < STEPS.length - 1 && (
            <Anchor component="button" type="button" c="dimmed" size="sm" onClick={skip}>
              Skip for now
            </Anchor>
          )}
        </div>
      </header>

      {/* Short steps are centred in the viewport; a tall one starts at the top
          and scrolls, since centring it would only push the heading off the
          screen — and flex centring breaks the sticky footer it needs. */}
      <main className={`${s.body} ${tall ? "" : s.bodyCentred}`}>
        <div className={`${s.column} ${wide ? s.columnWide : ""}`}>
          {current && (
            <div>
              <span className={s.eyebrow}>
                Step {displayStep + 1} of {displaySteps.length}
              </span>
              <h1 className={s.title}>
                {step === INSTALL_STEP ? (aiCopy?.readyHeadline ?? current.title) : current.title}
              </h1>

              <p className={s.lede}>{current.lede}</p>
            </div>
          )}

          <div style={{ marginTop: "2rem" }}>
    
            {step === 0 && (
              <ProfileStep onDone={() => (workspaces.length ? done() : setStep(REFERRAL_STEP))} />
            )}

            {step === REFERRAL_STEP && (
              <ReferralStepBody selected={referralSources} onChange={setReferralSources} />
            )}

            {step === WORKSPACE_STEP && (
              <WorkspaceStepBody
                wsName={wsName}
                wsError={wsError}
                onChange={(val) => {
                  setWsName(val);
                  setWsError(null);
                }}
                onSubmit={submitWorkspace}
              />
            )}

            {step === SITE_STEP && (
              <SiteStepBody
                siteName={siteName}
                siteError={siteError}
                onSiteNameChange={(val) => {
                  setSiteName(val);
                  setSiteError(null);
                }}
                domain={domain}
                domainError={domainError}
                onDomainChange={(val) => {
                  setDomain(val);
                  setDomainError(null);
                }}
                purpose={purpose}
                onPurposeChange={setPurpose}
              />
            )}

            {step === FRAMEWORK_STEP && (
              <FrameworkStepBody framework={framework} onFrameworkChange={setFramework} />
            )}

            {step === INSTALL_STEP && site && (
              <ReadyStepBody
                site={site}
                framework={framework}
                guide={guide}
                aiCopy={aiCopy}
                workspaceId={wsId}
              />
            )}
          </div>

          {footer && (
            <div className={tall ? s.footSticky : s.foot}>{footer}</div>
          )}
        </div>
      </main>
    </div>
  );
}
