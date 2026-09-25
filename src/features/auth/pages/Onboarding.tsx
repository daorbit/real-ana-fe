import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ActionIcon, Anchor } from "@mantine/core";
import { ChevronLeft } from "lucide-react";
import { Wordmark } from "@/shared/ui/Brand";
import { ProfileStep } from "@/features/auth/components/ProfileStep";
import { AppearanceStep } from "@/features/auth/components/onboarding/AppearanceStep";
import { BillingStep } from "@/features/auth/components/onboarding/BillingStep";
import { Stepper, SetupRail } from "@/features/auth/components/onboarding/Stepper";
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
  {
    label: "Appearance",
    hint: "Mode, accent, background",
    title: "Make it yours",
    lede: "Pick a mode, an accent, and a background — you can change any of it later from Settings.",
  },
  {
    label: "Plan",
    hint: "Upgrade or stay free",
    title: "Pick a plan",
    lede: "Free works forever — upgrade now or later from Billing, whenever it's useful.",
  },
];

const REFERRAL_STEP = 1;
const WORKSPACE_STEP = 2;
const SITE_STEP = 3;
const FRAMEWORK_STEP = 4;
const INSTALL_STEP = 5;

/** Index into `STEPS` of the first step that may be skipped. */
const FIRST_SKIPPABLE_STEP = 1;


const APPEARANCE_STEP = 6;
const BILLING_STEP = 7;


const SLUGS = [
  "details", "referral", "workspace", "site", "framework", "install", "appearance", "billing",
];


function furthestReachable(step: number, wsId: string | null, site: Site | null): number {

  if (step >= INSTALL_STEP && !site) return wsId ? FRAMEWORK_STEP : WORKSPACE_STEP;
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

/**
 * The bar across the top of setup. On a phone it reads like an app's
 * navigation bar: a back chevron, the progress pills, and Skip — the wordmark
 * drops out to give the pills the room.
 */
function SetupBar({
  step,
  steps,
  onBack,
  onSkip,
}: {
  step: number;
  steps: typeof STEPS;
  onBack?: () => void;
  onSkip?: () => void;
}) {
  return (
    <header className={s.bar}>
      <div className={s.barStart}>
        {onBack ? (
          <ActionIcon
            className={s.barBack}
            variant="subtle"
            color="gray"
            size={40}
            radius="xl"
            onClick={onBack}
            aria-label="Back"
          >
            <ChevronLeft size={22} />
          </ActionIcon>
        ) : (
          <span className={s.barBack} aria-hidden="true" />
        )}
        <div className={s.barBrand}>
          <Wordmark />
        </div>
      </div>
      <Stepper step={step} steps={steps} />
      <div className={s.barEnd}>
        {onSkip && (
          <Anchor component="button" type="button" c="dimmed" size="sm" onClick={onSkip}>
            <span className={s.skipLong}>Skip for now</span>
            <span className={s.skipShort}>Skip</span>
          </Anchor>
        )}
      </div>
    </header>
  );
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

  const clearProgress = () => {
    try {
      sessionStorage.removeItem(PROGRESS_KEY);
    } catch {
      // Nothing to do: the entry expires with the tab regardless.
    }
  };


  const skip = () => {
    trace(user?.id, "onboarding_skipped", "onboarding", "app");
    localStorage.setItem("quantalog_onboarding_skipped", "1");
    // The overlay says "your workspace is ready" — true, and worth the same
    // landing, whenever skipping still leaves one behind. Skipping out of the
    // referral step, before the workspace step has run, leaves none, so the
    // flag stays unset rather than promising something that isn't there yet.
    if (wsId) localStorage.setItem(WELCOME_PENDING_KEY, "1");
    clearProgress();
    nav(workspaceOnly ? "/app/workspaces" : "/app");
  };

  /** Finished properly — the account has a workspace, so the guard passes. */
  const done = () => {
    localStorage.removeItem("quantalog_onboarding_skipped");
    // Shown every time this flow finishes, first signup or an existing
    // account adding another workspace — each is a "your workspace is ready"
    // moment worth the same landing.
    localStorage.setItem(WELCOME_PENDING_KEY, "1");
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


  /** Where the header's back chevron goes — the same place each step's own
   *  Back button does. Absent on the first screen of either path. */
  const PREV: Record<number, number | undefined> = {
    [REFERRAL_STEP]: workspaceOnly ? undefined : 0,
    [WORKSPACE_STEP]: workspaceOnly ? undefined : REFERRAL_STEP,
    [SITE_STEP]: WORKSPACE_STEP,
    [FRAMEWORK_STEP]: SITE_STEP,
    [INSTALL_STEP]: FRAMEWORK_STEP,
    [APPEARANCE_STEP]: INSTALL_STEP,
    [BILLING_STEP]: APPEARANCE_STEP,
  };
  const prev = PREV[step];
  const goBack = prev === undefined ? undefined : () => setStep(prev);

  const displaySteps = workspaceOnly
    ? STEPS.filter((_, i) => i !== 0 && i !== REFERRAL_STEP)
    : STEPS;
  const displayStep = workspaceOnly
    ? STEPS.slice(0, step).filter((_, i) => i !== 0 && i !== REFERRAL_STEP).length
    : step;

  if (step === APPEARANCE_STEP || step === BILLING_STEP) {
    const wide = STEPS[step];
    return (
      <div className={`${s.shell} onb-form`}>
        <div className={s.wash} aria-hidden="true" />
        <SetupRail step={displayStep} steps={displaySteps} onSkip={skip} brand={<Wordmark />} />
        <div className={s.main}>
        <SetupBar step={displayStep} steps={displaySteps} onBack={goBack} onSkip={skip} />

        {/* These two steps are full-bleed — a theme picker beside a preview, a
            three-across pricing grid — so they cannot use the centred column
            the other steps put their heading in, and until now they simply had
            no heading at all. Every other screen in the flow says what it is
            asking; landing on a wall of plan cards with nothing above it was
            the one place that did not. */}
        {wide && (
          <div className={s.wideHead}>
            <h1 className={s.wideTitle}>{wide.title}</h1>
            <p className={s.wideLede}>{wide.lede}</p>
          </div>
        )}

        {step === APPEARANCE_STEP ? (
          <AppearanceStep onBack={() => setStep(INSTALL_STEP)} onDone={() => setStep(BILLING_STEP)} />
        ) : (
          <BillingStep onBack={() => setStep(APPEARANCE_STEP)} onDone={done} />
        )}
        </div>
      </div>
    );
  }

  const canSkip = step >= FIRST_SKIPPABLE_STEP && step < STEPS.length - 1;
  const current = STEPS[step];
  const wide = current?.wide;
  const tall = current?.tall;


  const footer =
    step === REFERRAL_STEP ? (
      <ReferralStepFooter
        onBack={workspaceOnly ? undefined : () => setStep(0)}
        onSkip={submitReferral}
        onSubmit={submitReferral}
        selectedCount={referralSources.length}
      />
    ) : step === WORKSPACE_STEP ? (
      <WorkspaceStepFooter
        loading={creatingWs}
        onBack={workspaceOnly ? undefined : () => setStep(REFERRAL_STEP)}
        onSubmit={submitWorkspace}
      />
    ) : step === SITE_STEP ? (
      <SiteStepFooter onBack={() => setStep(WORKSPACE_STEP)} onSubmit={submitSiteDetails} />
    ) : step === FRAMEWORK_STEP ? (
      <FrameworkStepFooter loading={creatingSite} onBack={() => setStep(SITE_STEP)} onSubmit={submitFramework} />
    ) : step === INSTALL_STEP && site ? (
      <ReadyStepFooter
        onBack={() => setStep(FRAMEWORK_STEP)}
        onContinue={() => setStep(APPEARANCE_STEP)}
      />
    ) : null;

  return (
    <div className={`${s.shell} onb-form`}>
      <div className={s.wash} aria-hidden="true" />
      <SetupRail step={displayStep} steps={displaySteps} onSkip={canSkip ? skip : undefined} brand={<Wordmark />} />
      <div className={s.main}>
      <SetupBar
        step={displayStep}
        steps={displaySteps}
        onBack={goBack}
        onSkip={canSkip ? skip : undefined}
      />

      <main className={`${s.body} ${tall ? "" : s.bodyCentred}`}>
        <div className={`${s.column} ${wide ? s.columnWide : ""}`}>
          {current && (
            <div>
           
              <h1 className={s.title}>
                {step === INSTALL_STEP ? (aiCopy?.readyHeadline ?? current.title) : current.title}
              </h1>

              <p className={s.lede}>{current.lede}</p>
            </div>
          )}

          <div className={s.controls}>

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
    </div>
  );
}
