import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Button, Group, Text, Title, TextInput, SimpleGrid, UnstyledButton,
  Stack, Anchor, Badge,
} from "@mantine/core";
import { ArrowRight, ArrowLeft, Globe, Zap } from "lucide-react";
import { OnboardingBrand } from "@/features/auth/components/OnboardingBrand";
import { ProfileStep } from "@/features/auth/components/ProfileStep";
import { BrandIcon } from "@/shared/ui/BrandIcon";
import { CodeBlock } from "@/shared/ui/CodeBlock";
import { InstallCheck } from "@/features/workspace/components/InstallCheck";
import { useCreateWorkspaceMutation, useCreateSiteMutation } from "@/app/store";
import { useWorkspace } from "@/features/workspace/context";
import { FRAMEWORKS, getFramework, frameworkLanguage } from "@/features/workspace/frameworks";
import type { FrameworkId } from "@/features/workspace/frameworks";
import * as v from "@/shared/lib/validate";
import { notifyError } from "@/shared/lib/notify";
import type { Site } from "@/shared/types";

const STEPS = [
  { label: "Your details", hint: "Name, mobile and photo" },
  { label: "Workspace", hint: "Where your sites live" },
  { label: "Your site", hint: "What you want to track" },
  { label: "Install", hint: "One script tag" },
];

// Same three steps, minus the profile one — used when an existing account
// with a profile already filled in adds a second workspace. Keeping this as
// its own array rather than STEPS.slice(1) so the brand panel's numbering
// ("Step 1 of 3") reads correctly instead of starting at "2 of 4".
const WORKSPACE_ONLY_STEPS = [
  { label: "Workspace", hint: "Where your sites live" },
  { label: "Your site", hint: "What you want to track" },
  { label: "Install", hint: "One script tag" },
];

/**
 * The first step is the only one that can't be skipped.
 *
 * Everything after it has a fallback — the Home checklist picks up a missing
 * workspace or site. A missing mobile has no such recovery: WhatsApp delivery
 * simply refuses to turn on, in a screen far away from here, and the reason is
 * not obvious from there.
 */
const FIRST_SKIPPABLE_STEP = 1;

/**
 * First-run setup: your details, workspace, site, snippet.
 *
 * Full-page, using the same split as the auth screens — someone arriving from
 * signup stays in one continuous flow. The step list sits in the brand panel
 * so the form column holds exactly one question at a time.
 *
 * Every step but the first is skippable; the Home checklist covers anyone who
 * leaves early, so this is never a wall between someone and the product. The
 * exception is explained at `FIRST_SKIPPABLE_STEP`.
 */
export default function Onboarding() {
  const nav = useNavigate();
  const { setActive, workspaces } = useWorkspace();
  const [params] = useSearchParams();

  // Triggered by "New workspace" for an account that already exists — the
  // profile step is meaningless here (there's nothing to fill in that
  // isn't already set), so this skips straight to naming the workspace and
  // returns to the workspace list rather than the dashboard on completion.
  const workspaceOnly = params.get("mode") === "workspace";

  const [step, setStep] = useState(workspaceOnly ? 1 : 0);
  const [createWorkspace, { isLoading: creatingWs }] = useCreateWorkspaceMutation();
  const [createSite, { isLoading: creatingSite }] = useCreateSiteMutation();

  // step 1
  const [wsName, setWsName] = useState("");
  const [wsId, setWsId] = useState<string | null>(null);
  const [wsError, setWsError] = useState<string | null>(null);

  // step 2
  const [siteName, setSiteName] = useState("");
  const [domain, setDomain] = useState("");
  const [framework, setFramework] = useState<FrameworkId>("html");
  const [siteError, setSiteError] = useState<string | null>(null);
  const [domainError, setDomainError] = useState<string | null>(null);

  // step 3
  const [site, setSite] = useState<Site | null>(null);

  const guide = getFramework(framework);

  /**
   * Leave setup early. The flag is what stops the route guard sending an
   * account with no workspace straight back here — without it, "Skip for now"
   * would be a no-op loop.
   */
  const skip = () => {
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

    try {
      const created = await createSite({
        workspaceId: wsId,
        name: siteName.trim(),
        domain: v.normalizeDomain(domain),
        framework,
      }).unwrap();
      setSite(created);
      setStep(3);
    } catch (e) {
      notifyError(e, "Could not add the site.");
    }
  };

  // The brand panel's step list and "Step N of M" counter both index into
  // whichever array is showing — workspaceOnly drops the profile step
  // entirely, so its indices need shifting down by one to stay correct
  // rather than starting the count at "2 of 4".
  const displaySteps = workspaceOnly ? WORKSPACE_ONLY_STEPS : STEPS;
  const displayStep = workspaceOnly ? step - 1 : step;

  return (
    <div className="auth-split onb-split">
      <OnboardingBrand step={displayStep} steps={displaySteps} />

      <div className="onb-panel">
        <div className="onb-col">
          <Group justify="space-between" mb="xl" wrap="nowrap">
            <Text size="xs" c="dimmed" fw={600} style={{ letterSpacing: "0.06em" }}>
              STEP {displayStep + 1} OF {displaySteps.length}
            </Text>
            {step >= FIRST_SKIPPABLE_STEP && step < STEPS.length - 1 && (
              <Anchor component="button" type="button" c="dimmed" size="sm" onClick={skip}>
                Skip for now
              </Anchor>
            )}
          </Group>

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
                <Stack gap="xl">
                  <div>
                    <Title order={2} style={{ letterSpacing: "-0.02em" }}>
                      Name your workspace
                    </Title>
                    <Text c="dimmed" size="sm" mt={8}>
                      A workspace groups the sites you track together — usually
                      your company, or one client.
                    </Text>
                  </div>

                  <TextInput
                    size="md"
                    label="Workspace name"
                    placeholder="Acme Inc"
                    value={wsName}
                    error={wsError}
                    onChange={(e) => {
                      setWsName(e.currentTarget.value);
                      setWsError(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && submitWorkspace()}
                    data-autofocus
                  />

                  <Button
                    size="md"
                    fullWidth
                    loading={creatingWs}
                    onClick={submitWorkspace}
                    rightSection={<ArrowRight size={16} />}
                  >
                    Continue
                  </Button>
                </Stack>
              )}

              {step === 2 && (
                <Stack gap="xl">
                  <div>
                    <Title order={2} style={{ letterSpacing: "-0.02em" }}>
                      Add your first site
                    </Title>
                    <Text c="dimmed" size="sm" mt={8}>
                      Tell us what you&apos;re tracking and what it&apos;s built
                      with — we&apos;ll tailor the install instructions.
                    </Text>
                  </div>

                  <TextInput
                    size="md"
                    label="Site name"
                    placeholder="Marketing site"
                    value={siteName}
                    error={siteError}
                    onChange={(e) => {
                      setSiteName(e.currentTarget.value);
                      setSiteError(null);
                    }}
                    data-autofocus
                  />

                  <TextInput
                    size="md"
                    label="Domain"
                    placeholder="example.com"
                    leftSection={<Globe size={15} />}
                    value={domain}
                    error={domainError}
                    onChange={(e) => {
                      setDomain(e.currentTarget.value);
                      setDomainError(null);
                    }}
                  />

                  <div>
                    <Text size="sm" fw={500} mb={2}>
                      What is it built with?
                    </Text>
                    <Text size="xs" c="dimmed" mb="sm">
                      Only changes the install snippet you get next.
                    </Text>
                    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
                      {FRAMEWORKS.map((f) => (
                        <UnstyledButton
                          key={f.id}
                          className="onb-fw tile"
                          data-selected={framework === f.id}
                          aria-pressed={framework === f.id}
                          onClick={() => setFramework(f.id)}
                        >
                          <BrandIcon framework={f.id} size={24} />
                          <Text size="sm" fw={framework === f.id ? 600 : 500}>
                            {f.label}
                          </Text>
                        </UnstyledButton>
                      ))}
                    </SimpleGrid>
                  </div>

                  <Group grow>
                    <Button
                      size="md"
                      variant="default"
                      leftSection={<ArrowLeft size={15} />}
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      size="md"
                      loading={creatingSite}
                      onClick={submitSite}
                      rightSection={<ArrowRight size={16} />}
                    >
                      Continue
                    </Button>
                  </Group>
                </Stack>
              )}

              {step === 3 && site && (
                <Stack gap="lg">
                  <div>
                    <Title order={2} style={{ letterSpacing: "-0.02em" }}>
                      You&apos;re ready
                    </Title>
                    <Group gap={8} mt={8} wrap="nowrap">
                      <BrandIcon framework={framework} size={15} />
                      <Text c="dimmed" size="sm">
                        {guide.placement}
                      </Text>
                    </Group>
                  </div>

                  <CodeBlock
                    code={guide.code(site.siteId, {})}
                    filename={guide.filename}
                    language={frameworkLanguage(guide.id)}
                  />

                  {guide.note && (
                    <Text size="xs" c="dimmed">
                      {guide.note}
                    </Text>
                  )}

                  {wsId && (
                    <InstallCheck
                      workspaceId={wsId}
                      siteId={site.siteId}
                      domain={site.domain}
                    />
                  )}

                  <Group gap={6}>
                    <Zap size={14} style={{ color: "var(--violet-2)" }} />
                    <Text size="xs" c="dimmed">
                      Numbers appear within seconds of your first visitor.
                    </Text>
                  </Group>

                  <Button
                    size="md"
                    fullWidth
                    onClick={done}
                    rightSection={<ArrowRight size={16} />}
                  >
                    Go to dashboard
                  </Button>
                </Stack>
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
      </div>
    </div>
  );
}
