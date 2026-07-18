import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Button, Group, Text, Title, TextInput, SimpleGrid, UnstyledButton,
  Stack, Anchor, Badge,
} from "@mantine/core";
import { ArrowRight, ArrowLeft, Globe, Sparkles } from "lucide-react";
import { OnboardingBrand } from "../components/OnboardingBrand";
import { BrandIcon } from "../components/BrandIcon";
import { CodeBlock } from "../components/CodeBlock";
import { InstallCheck } from "../components/InstallCheck";
import { useCreateWorkspaceMutation, useCreateSiteMutation } from "../store";
import { useWorkspace } from "../workspace";
import { FRAMEWORKS, getFramework, frameworkLanguage } from "../utils/frameworks";
import type { FrameworkId } from "../utils/frameworks";
import * as v from "../utils/validate";
import { notify, errMessage } from "../notify";
import type { Site } from "../types";

const STEPS = [
  { label: "Workspace", hint: "Where your sites live" },
  { label: "Your site", hint: "What you want to track" },
  { label: "Install", hint: "One script tag" },
];

/**
 * First-run setup: workspace, site, snippet.
 *
 * Full-page, using the same split as the auth screens — someone arriving from
 * signup stays in one continuous flow. The step list sits in the brand panel
 * so the form column holds exactly one question at a time.
 *
 * Every step is skippable; the Home checklist covers anyone who leaves early,
 * so this is never a wall between someone and the product.
 */
export default function Onboarding() {
  const nav = useNavigate();
  const { setActive } = useWorkspace();

  const [step, setStep] = useState(0);
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
    nav("/app");
  };

  /** Finished properly — the account has a workspace, so the guard passes. */
  const done = () => {
    localStorage.removeItem("quantalog_onboarding_skipped");
    nav("/app");
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
      setStep(1);
    } catch (e) {
      notify.error(errMessage(e, "Could not create the workspace."));
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
      setStep(2);
    } catch (e) {
      notify.error(errMessage(e, "Could not add the site."));
    }
  };

  return (
    <div className="auth-split onb-split">
      <OnboardingBrand step={step} steps={STEPS} />

      <div className="onb-panel">
        <div className="onb-col">
          <Group justify="space-between" mb="xl" wrap="nowrap">
            <Text size="xs" c="dimmed" fw={600} style={{ letterSpacing: "0.06em" }}>
              STEP {step + 1} OF {STEPS.length}
            </Text>
            {step < 2 && (
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
              {step === 0 && (
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

              {step === 1 && (
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
                      onClick={() => setStep(0)}
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

              {step === 2 && site && (
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
                    <Sparkles size={14} style={{ color: "var(--violet-2)" }} />
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
