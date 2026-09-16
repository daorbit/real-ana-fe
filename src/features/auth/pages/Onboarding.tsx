import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Anchor } from "@mantine/core";
import { Wordmark } from "@/shared/ui/Brand";
import { ProfileStep } from "@/features/auth/components/ProfileStep";
import { AppearanceStep } from "@/features/auth/components/onboarding/AppearanceStep";
import { Stepper } from "@/features/auth/components/onboarding/Stepper";
import { WorkspaceStepBody, WorkspaceStepFooter } from "@/features/auth/components/onboarding/WorkspaceStep";
import { SiteStepBody, SiteStepFooter } from "@/features/auth/components/onboarding/SiteStep";
import { ReadyStepBody, ReadyStepFooter } from "@/features/auth/components/onboarding/ReadyStep";
import { FormStepBody } from "@/features/auth/components/onboarding/FormStep";
import { generateForm, saveForm, mintWorkspaceToken } from "@/features/auth/components/onboarding/formsApi";
import type { GeneratedForm } from "@/features/auth/components/onboarding/formsApi";
import { useCreateWorkspaceMutation, useCreateSiteMutation, useGenerateOnboardingCopyMutation } from "@/app/store";
import { useWorkspace } from "@/features/workspace/context";
import { getFramework } from "@/features/workspace/frameworks";
import type { FrameworkId } from "@/features/workspace/frameworks";
import * as v from "@/shared/lib/validate";
import { notifyError } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";
import { useAuth } from "@/features/auth/context";
import type { Site } from "@/shared/types";
import s from "@/features/auth/components/onboarding/Onboarding.module.css";

/**
 * Copy for each step, kept beside the step list rather than inside the step
 * components: the shell renders the heading, so the two have to agree, and a
 * title living in one file with its stepper label in another is how they drift
 * apart.
 *
 * `wide` opts a step out of the 520px measure — the framework picker and the
 * install snippet both need the room.
 */
const STEPS = [
  {
    label: "Your details",
    hint: "Name, mobile and photo",
    title: "Tell us who you are",
    lede: "This is the name your teammates see on reports and comments.",
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
    wide: true,
    /** Taller than the viewport: it scrolls, so its footer sticks. */
    tall: true,
  },
  {
    label: "Your first form",
    hint: "Built for you by AI",
    title: "Let's build your first form",
    lede: "Describe what you want to collect and we'll draft it — you can change anything afterwards.",
    wide: true,
  },
  {
    label: "Install",
    hint: "One script tag",
    title: "You're ready",
    lede: "Add this to your site and the numbers start arriving.",
    wide: true,
  },
];

/**
 * The forms step, by index.
 *
 * Only offered during first-run setup. An existing account adding another
 * workspace has been through this once, and generating a second form it never
 * asked for would spend its AI quota to make a point it already understands.
 */
const FORM_STEP = 3;
const INSTALL_STEP = 4;

/** Index into `STEPS` of the first step that may be skipped. */
const FIRST_SKIPPABLE_STEP = 1;

/** The appearance screen, which sits past the stepper and runs its own layout. */
const APPEARANCE_STEP = 5;


const SLUGS = ["details", "workspace", "site", "form", "install", "appearance"];


function furthestReachable(step: number, wsId: string | null, site: Site | null): number {
  if (step >= INSTALL_STEP && !site) return wsId ? FORM_STEP : 1;
  if (step >= FORM_STEP && !wsId) return 1;
  if (step >= 2 && !wsId) return 1;
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
  const { user } = useAuth();
  const [params] = useSearchParams();


  const workspaceOnly = params.get("mode") === "workspace";

  // Seeded once: the flow owns its progress from here, and re-reading storage
  // on every render would fight the state it sets.
  const [restored] = useState(readProgress);


  const slugStep = SLUGS.indexOf(params.get("step") ?? "");
  const urlStep = slugStep >= 0 ? slugStep : workspaceOnly ? 1 : 0;

  const setStep = (next: number) => {
    const search = new URLSearchParams(params);
    search.set("step", SLUGS[next] ?? SLUGS[0]);
    nav({ search: search.toString() }, { replace: true });
  };
  const [createWorkspace, { isLoading: creatingWs }] = useCreateWorkspaceMutation();
  const [createSite, { isLoading: creatingSite }] = useCreateSiteMutation();
  const [generateOnboardingCopy] = useGenerateOnboardingCopyMutation();

  // step 1
  const [wsName, setWsName] = useState("");
  const [wsId, setWsId] = useState<string | null>(restored.wsId);
  const [wsError, setWsError] = useState<string | null>(null);

  // step 2
  const [siteName, setSiteName] = useState("");
  const [domain, setDomain] = useState("");
  const [framework, setFramework] = useState<FrameworkId>("html");
  const [purpose, setPurpose] = useState("");
  const [siteError, setSiteError] = useState<string | null>(null);
  const [domainError, setDomainError] = useState<string | null>(null);

  // step 3 — the AI form
  const [formPrompt, setFormPrompt] = useState("");
  const [generatedForm, setGeneratedForm] = useState<GeneratedForm | null>(null);
  const [formBusy, setFormBusy] = useState<"generating" | "saving" | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // step 4
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
    clearProgress();
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
      // The forms step is first-run only; an account adding a second
      // workspace goes straight to the snippet.
      setStep(workspaceOnly ? INSTALL_STEP : FORM_STEP);

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

  /**
   * Draft a form from the prompt.
   *
   * The workspace token is minted per attempt rather than held: it lasts an
   * hour, this is one call, and a token fetched once at step three would be a
   * thing to keep fresh for no gain.
   */
  const generate = async () => {
    const text = formPrompt.trim();
    if (!text || !wsId) return;

    setFormBusy("generating");
    setFormError(null);
    trace(user?.id, "onboarding_form_generated", "onboarding", "form");

    try {
      const token = await mintWorkspaceToken(wsId);
      setGeneratedForm(await generateForm(wsId, token, text));
    } catch (e) {
      // Shown in the step rather than as a toast: the retry button is right
      // there, and this is the one thing on screen that just failed.
      setFormError(
        e instanceof Error ? e.message : "The form could not be generated.",
      );
    } finally {
      setFormBusy(null);
    }
  };

  /** Keep the draft, then carry on to the snippet. */
  const keepForm = async () => {
    if (!generatedForm || !wsId) return;

    setFormBusy("saving");
    setFormError(null);

    try {
      const token = await mintWorkspaceToken(wsId);
      await saveForm(wsId, token, generatedForm);
      trace(user?.id, "onboarding_form_kept", "onboarding", "form");
      setStep(INSTALL_STEP);
    } catch (e) {
      setFormError(
        e instanceof Error ? e.message : "The form could not be saved.",
      );
    } finally {
      setFormBusy(null);
    }
  };

  /** Move past the form step without creating one. */
  const skipForm = () => {
    trace(user?.id, "onboarding_form_skipped", "onboarding", "form");
    setStep(INSTALL_STEP);
  };

  // The appearance step runs its own full-width layout and sits past the
  // stepper, so it returns before any of the shell below is built.
  if (step === APPEARANCE_STEP) {
    return <AppearanceStep onBack={() => setStep(INSTALL_STEP)} onDone={done} />;
  }

  /**
   * What the stepper shows. An account adding another workspace skips both
   * its own details and the forms step, so those come out of the list as well
   * as out of the flow — a stepper promising a step that never arrives is
   * worse than one step shorter.
   */
  const displaySteps = workspaceOnly
    ? STEPS.filter((_, i) => i !== 0 && i !== FORM_STEP)
    : STEPS;
  const displayStep = workspaceOnly
    ? STEPS.slice(0, step).filter((_, i) => i !== 0 && i !== FORM_STEP).length
    : step;
  const current = STEPS[step];
  const wide = current?.wide;
  // The forms step is a centred prompt box until a draft comes back; only then
  // does it grow a preview tall enough to need scrolling.
  const tall = current?.tall || (step === FORM_STEP && generatedForm !== null);

  const footer =
    step === 1 ? (
      <WorkspaceStepFooter loading={creatingWs} onSubmit={submitWorkspace} />
    ) : step === 2 ? (
      <SiteStepFooter loading={creatingSite} onBack={() => setStep(1)} onSubmit={submitSite} />
    ) : // The forms step has no footer: its actions sit in the step itself, in
    // a bar above the preview they apply to.
    step === INSTALL_STEP && site ? (
      <ReadyStepFooter onContinue={() => setStep(APPEARANCE_STEP)} />
    ) : null;

  return (
    <div className={`${s.shell} onb-form`}>
      <header className={s.bar}>
        <Wordmark />
        <Stepper step={displayStep} steps={displaySteps} />
        <div className={s.barEnd}>
          {/* The form step carries its own "Skip this", which leaves setup
              running rather than abandoning it — two skips meaning different
              things side by side is a trap. */}
          {step >= FIRST_SKIPPABLE_STEP && step < STEPS.length - 1 && step !== FORM_STEP && (
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
                {step === INSTALL_STEP
                  ? (aiCopy?.readyHeadline ?? current.title)
                  : step === FORM_STEP && generatedForm
                    ? "Here's your first form"
                    : current.title}
              </h1>

              {!(step === FORM_STEP && generatedForm) && (
                <p className={s.lede}>{current.lede}</p>
              )}
            </div>
          )}

          <div style={{ marginTop: "2rem" }}>
    
            {step === 0 && (
              <ProfileStep onDone={() => (workspaces.length ? done() : setStep(1))} />
            )}

            {step === 1 && (
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

            {step === 2 && (
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
                framework={framework}
                onFrameworkChange={setFramework}
              />
            )}

            {step === FORM_STEP && (
              <FormStepBody
                purpose={purpose}
                prompt={formPrompt}
                onPromptChange={(val) => {
                  setFormPrompt(val);
                  setFormError(null);
                }}
                form={generatedForm}
                generating={formBusy === "generating"}
                saving={formBusy === "saving"}
                error={formError}
                onGenerate={generate}
                onBack={() => setStep(2)}
                onSkip={skipForm}
                onKeep={keepForm}
                onDiscard={() => {
                  setGeneratedForm(null);
                  setFormError(null);
                }}
              />
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
