import { useState } from "react";
import {
  Modal, Stack, Group, Button, TextInput, Switch, Divider, Text,
  Code, ThemeIcon, Box, ActionIcon, ScrollArea, UnstyledButton, SimpleGrid,
} from "@mantine/core";
import {
  ArrowLeft, ArrowRight, Check, Globe, PartyPopper, X, Settings2, Code2,
  Smartphone, LayoutGrid,
} from "lucide-react";
import { CodeBlock } from "@/shared/ui/CodeBlock";
import { InstallCheck } from "@/features/workspace/components/InstallCheck";
import { useCreateSiteMutation } from "@/app/store";
import { type TrackerOptions } from "@/features/workspace";
import {
  getFramework, frameworkLanguage, type FrameworkId,
} from "@/features/workspace/frameworks";
import { FrameworkPicker } from "@/features/workspace/components/FrameworkPicker";
import { mobileSteps } from "@/features/workspace/mobileGuide";
import { API_ORIGIN } from "@/shared/lib/http";
import * as v from "@/shared/lib/validate";
import { notify, notifyError } from "@/shared/lib/notify";
import type { Site } from "@/shared/types";

type Platform = "web" | "app";

/** The stops, in order, as the rail draws them. Web has one extra (Tracking). */
const WEB_STEPS = [
  { label: "Platform", description: "Web or app", icon: LayoutGrid },
  { label: "Site", description: "Name and domain", icon: Globe },
  { label: "Tracking", description: "How it collects", icon: Settings2 },
  { label: "Install", description: "Copy the snippet", icon: Code2 },
];
const APP_STEPS = [
  { label: "Platform", description: "Web or app", icon: LayoutGrid },
  { label: "App", description: "Name and bundle id", icon: Smartphone },
  { label: "Install", description: "SDK + identify()", icon: Code2 },
];

/** Split a comma-separated field into clean entries. */
function list(s: string): string[] {
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

/**
 * Three-step flow for adding a site: details, tracking options, then the
 * finished snippet.
 *
 * The options are collected *before* the snippet exists so the code shown at
 * the end is already correct — there is no "change a toggle, silently hold a
 * stale snippet" state. They are also saved on the site, so the exact same tag
 * can be rebuilt later without the user remembering what they chose.
 */
export function AddSiteWizard({
  opened,
  onClose,
  workspaceId,
  existingDomains,
}: {
  opened: boolean;
  onClose: () => void;
  workspaceId: string;
  existingDomains: string[];
}) {
  const [step, setStep] = useState(0);
  const [createSite, { isLoading: creating }] = useCreateSiteMutation();

  // step 0 — platform
  const [platform, setPlatform] = useState<Platform>("web");

  // step 1 (web) / step 1 (app) — identity
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [bundleId, setBundleId] = useState("");
  const [framework, setFramework] = useState<FrameworkId>("html");
  const [nameError, setNameError] = useState<string | null>(null);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [bundleIdError, setBundleIdError] = useState<string | null>(null);

  // step 2 (web only) — tracking options
  const [dnt, setDnt] = useState(false);
  const [hash, setHash] = useState(false);
  const [clicks, setClicks] = useState(true);
  const [errors, setErrors] = useState(true);
  const [ignorePages, setIgnorePages] = useState("");
  const [allowParams, setAllowParams] = useState("");
  const [reportDomain, setReportDomain] = useState("");

  // last step — result
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

  const guide = getFramework(framework);
  const STEPS = platform === "app" ? APP_STEPS : WEB_STEPS;
  const lastStep = STEPS.length - 1;

  const reset = () => {
    setStep(0);
    setPlatform("web");
    setName("");
    setDomain("");
    setBundleId("");
    setFramework("html");
    setNameError(null);
    setDomainError(null);
    setBundleIdError(null);
    setDnt(false);
    setHash(false);
    setClicks(true);
    setErrors(true);
    setIgnorePages("");
    setAllowParams("");
    setReportDomain("");
    setCreated(null);
  };

  const close = () => {
    onClose();
    // Let the modal finish animating out before the contents snap back.
    setTimeout(reset, 200);
  };

  const validateWebIdentity = () => {
    const nErr = v.all(v.required("Name"), v.maxLength("Name", 60))(name);
    const dErr = v.domain(domain);
    setNameError(nErr);
    setDomainError(dErr);
    if (nErr || dErr) return false;

    const clean = v.normalizeDomain(domain);
    if (existingDomains.includes(clean)) {
      setDomainError("A site with that domain already exists in this workspace");
      return false;
    }
    return true;
  };

  const validateAppIdentity = () => {
    const nErr = v.all(v.required("Name"), v.maxLength("Name", 60))(name);
    setNameError(nErr);
    // Bundle id is optional context (shown on the site card), not a tracking
    // key, so it isn't validated against a format — teams name these
    // differently across iOS/Android and a wrong guess here blocks nothing.
    setBundleIdError(null);
    return !nErr;
  };

  const createAppSite = async () => {
    try {
      const site = await createSite({
        workspaceId,
        name: name.trim(),
        platform: "app",
        bundleId: bundleId.trim(),
      }).unwrap();
      setCreated(site);
      setStep(lastStep);
      notify.success(`App "${site.name}" added.`);
    } catch (err) {
      notifyError(err, "Could not add the app.");
    }
  };

  const next = async () => {
    if (step === 0) {
      setStep(1);
      return;
    }

    if (platform === "app") {
      if (step === 1 && validateAppIdentity()) await createAppSite();
      return;
    }

    if (step === 1) {
      if (validateWebIdentity()) setStep(2);
      return;
    }

    if (step === 2) {
      // The site is created on leaving the options step, so the snippet on
      // the next step is the real one for a real siteId rather than a
      // preview to be re-copied later.
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
        setStep(3);
        notify.success(`Site "${site.name}" added.`);
      } catch (err) {
        notifyError(err, "Could not add the site.");
      }
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      fullScreen
      withCloseButton={false}
      padding={0}
      transitionProps={{ transition: "fade", duration: 150 }}
      // Closing mid-flow after the site exists would strand the snippet, so the
      // last step must be dismissed deliberately.
      closeOnClickOutside={step < lastStep}
      styles={{
        content: { display: "flex", flexDirection: "column", border: "none" },
        body: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" },
      }}
    >
      {/* Header: the close control and the title, on one bar across the top —
          the same shape the share composer opens with. */}
      <Group
        gap="sm"
        px={20}
        py="md"
        wrap="nowrap"
        style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
      >
        <ActionIcon variant="subtle" color="gray" size="lg" onClick={close} aria-label="Close">
          <X size={18} />
        </ActionIcon>
        <Divider orientation="vertical" my={6} />
        <Text fw={600}>{platform === "app" ? "Add an app" : "Add a site"}</Text>
      </Group>

      <Group gap={0} align="stretch" wrap="nowrap" style={{ flex: 1, minHeight: 0 }}>
        {/* The steps as a rail rather than a strip across the top. At full
            width a horizontal stepper leaves the form floating in the middle
            of a very wide page; down the side it frames the column instead. */}
        <Box className="wizard-rail" visibleFrom="sm">
          <Stack gap={4}>
            {STEPS.map((s, i) => {
              const state = i === step ? "current" : i < step ? "done" : "todo";
              const Icon = s.icon;
              return (
                <Box key={s.label} className="wizard-step" data-state={state}>
                  <ThemeIcon
                    size={30}
                    radius="md"
                    variant={state === "todo" ? "default" : "light"}
                    color={state === "todo" ? "gray" : "emerald"}
                  >
                    {state === "done" ? <Check size={15} /> : <Icon size={15} />}
                  </ThemeIcon>
                  <div style={{ minWidth: 0 }}>
                    <Text size="sm" fw={state === "current" ? 650 : 500}>{s.label}</Text>
                    <Text size="xs" c="dimmed">{s.description}</Text>
                  </div>
                </Box>
              );
            })}
          </Stack>
        </Box>

        <Box style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <ScrollArea style={{ flex: 1 }} type="auto">
            {/* The last step is code to read, which wants a single narrow
                column; the form steps before it are laid out in two. */}
            <Box className="wizard-body" data-wide={step < lastStep}>

      {/* Platform choice, first: everything after it — which fields, which
          install guide — depends on this, so it has to be answered before
          anything else can be asked. */}
      {step === 0 && (
        <Stack gap="md" maw={480}>
          <div>
            <Text size="sm" fw={500} mb={4}>What are you tracking?</Text>
            <Text size="xs" c="dimmed">
              Changes what you're asked next and which install guide you get —
              the events themselves land in the same dashboard either way.
            </Text>
          </div>
          <SimpleGrid cols={2} spacing="sm">
            <UnstyledButton
              className="onb-fw tile"
              data-selected={platform === "web"}
              aria-pressed={platform === "web"}
              onClick={() => setPlatform("web")}
              p="md"
            >
              <Globe size={22} />
              <Text size="sm" fw={platform === "web" ? 600 : 500}>Web app / site</Text>
              <Text size="xs" c="dimmed" fw={400}>A script tag. Anonymous by default.</Text>
            </UnstyledButton>
            <UnstyledButton
              className="onb-fw tile"
              data-selected={platform === "app"}
              aria-pressed={platform === "app"}
              onClick={() => setPlatform("app")}
              p="md"
            >
              <Smartphone size={22} />
              <Text size="sm" fw={platform === "app" ? 600 : 500}>App (web or mobile)</Text>
              <Text size="xs" c="dimmed" fw={400}>Platform API. Tied to your signed-up users, not anonymous.</Text>
            </UnstyledButton>
          </SimpleGrid>
        </Stack>
      )}

      {/* Web identity: two columns, the name/domain fields on the left, the
          framework grid on the right. Stacked, the grid pushed the fields
          off the top of a wide window and left the space either side of
          them empty — side by side the whole step fits without scrolling. */}
      {step === 1 && platform === "web" && (
        <div className="wizard-split">
          <Stack gap="md">
            <TextInput
              label="Site name"
              placeholder="e.g. Marketing site"
              description="Only used to identify this site in your dashboard."
              value={name}
              onChange={(e) => { setName(e.currentTarget.value); setNameError(null); }}
              error={nameError}
              data-autofocus
            />
            <TextInput
              label="Domain"
              placeholder="example.com"
              description="The site you'll install the tracker on. Paste a full URL if it's easier."
              leftSection={<Globe size={15} />}
              value={domain}
              onChange={(e) => { setDomain(e.currentTarget.value); setDomainError(null); }}
              error={domainError}
            />
          </Stack>

          <div>
            <Text size="sm" fw={500} mb={4}>What is it built with?</Text>
            <Text size="xs" c="dimmed" mb="sm">
              Only changes the install instructions you get at the end — the
              tracker itself is the same everywhere.
            </Text>
            <FrameworkPicker value={framework} onChange={setFramework} />
          </div>
        </div>
      )}

      {/* App identity: just a name and an optional bundle id — there's no
          domain and no framework choice, since every app uses the same SDK. */}
      {step === 1 && platform === "app" && (
        <Stack gap="md" maw={480}>
          <TextInput
            label="App name"
            placeholder="e.g. Quantalog mobile"
            description="Only used to identify this app in your dashboard."
            value={name}
            onChange={(e) => { setName(e.currentTarget.value); setNameError(null); }}
            error={nameError}
            data-autofocus
          />
          <TextInput
            label="Bundle id / package name"
            placeholder="com.yourcompany.app"
            description="Optional — shown on the app's card so you can tell two apps apart at a glance."
            leftSection={<Smartphone size={15} />}
            value={bundleId}
            onChange={(e) => { setBundleId(e.currentTarget.value); setBundleIdError(null); }}
            error={bundleIdError}
          />
        </Stack>
      )}

      {step === 2 && platform === "web" && (
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            These become attributes on your script tag. Every one is optional —
            the defaults are what most sites want.
          </Text>

          {/* The toggles are one question each and read as a set; the text
              fields below them all take a list. Two groups, two columns. */}
          <div className="wizard-split">
          <Stack gap="md">
          <Switch
            checked={dnt}
            onChange={(e) => setDnt(e.currentTarget.checked)}
            color="emerald"
            label="Respect Do Not Track"
            description="Skip visitors whose browser asks not to be tracked. Off by default — Quantalog stores no personal data either way."
          />
          <Switch
            checked={hash}
            onChange={(e) => setHash(e.currentTarget.checked)}
            color="emerald"
            label="Hash-based routing"
            description="Turn on if your app navigates with #/path — otherwise every route reports as one page."
          />
          <Switch
            checked={clicks}
            onChange={(e) => setClicks(e.currentTarget.checked)}
            color="emerald"
            label="Track clicks"
            description="Buttons, links, and anything tagged data-va-cta."
          />
          <Switch
            checked={errors}
            onChange={(e) => setErrors(e.currentTarget.checked)}
            color="emerald"
            label="Track JavaScript errors"
            description="Surfaces uncaught errors and failed promises by page."
          />
          </Stack>

          <Stack gap="md">
          <TextInput
            label="Ignore pages"
            placeholder="/admin/*, /preview"
            description="Comma-separated. Use * to match any run of characters."
            value={ignorePages}
            onChange={(e) => setIgnorePages(e.currentTarget.value)}
          />
          <TextInput
            label="Keep query parameters"
            placeholder="plan, ref"
            description="Query strings are dropped by default — they can carry personal data. Name the ones worth keeping."
            value={allowParams}
            onChange={(e) => setAllowParams(e.currentTarget.value)}
          />
          <TextInput
            label="Report as domain"
            placeholder="Leave empty to use the site's own domain"
            description="Lets a staging deploy report into this site's numbers."
            value={reportDomain}
            onChange={(e) => setReportDomain(e.currentTarget.value)}
          />
          </Stack>
          </div>
        </Stack>
      )}

      {step === lastStep && platform === "web" && created && (
        <Stack gap="md">
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon color="emerald" variant="light" radius="md" size={38}>
              <PartyPopper size={18} />
            </ThemeIcon>
            <Box>
              <Text fw={600} size="sm">{created.name} is ready</Text>
              <Text size="xs" c="dimmed">
                {guide.placement}
              </Text>
            </Box>
          </Group>

          <CodeBlock
            code={guide.code(created.siteId, options)}
            filename={guide.filename}
            language={frameworkLanguage(guide.id)}
          />

          {guide.note && (
            <Text size="xs" c="dimmed">{guide.note}</Text>
          )}

          <Group gap="xs">
            <Text size="xs" c="dimmed">Site ID:</Text>
            <Code>{created.siteId}</Code>
          </Group>

          <InstallCheck
            workspaceId={workspaceId}
            siteId={created.siteId}
            domain={created.domain}
          />

          <Text size="xs" c="dimmed">
            You can rebuild this snippet any time from the site&apos;s row —
            your options are saved.
          </Text>
        </Stack>
      )}

      {step === lastStep && platform === "app" && created && (
        <Stack gap="lg">
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon color="emerald" variant="light" radius="md" size={38}>
              <PartyPopper size={18} />
            </ThemeIcon>
            <Box>
              <Text fw={600} size="sm">{created.name} is ready</Text>
              <Text size="xs" c="dimmed">
                trace() posts straight to the Platform API with this site's
                id — no secret key involved, so it's safe to ship inside the
                app itself.
              </Text>
            </Box>
          </Group>

          {mobileSteps(created.siteId, API_ORIGIN).map((s) => (
            <Stack key={s.id} gap="xs">
              <Text size="sm" fw={600}>{s.title}</Text>
              <Text size="xs" c="dimmed">{s.blurb}</Text>
              <CodeBlock code={s.code} filename={s.filename} language="tsx" />
              {s.note && <Text size="xs" c="dimmed">{s.note}</Text>}
            </Stack>
          ))}

          <Group gap="xs">
            <Text size="xs" c="dimmed">Site ID:</Text>
            <Code>{created.siteId}</Code>
          </Group>

          <Text size="xs" c="dimmed">
            The full mobile tracking guide, with more on screens vs. events
            and custom properties, is always available in Help → Documentation.
          </Text>
        </Stack>
      )}

            </Box>
          </ScrollArea>

          {/* The footer stays put while the body scrolls, so the way forward is
              never something you have to scroll to find. */}
          <Box className="wizard-foot">
            <Group justify="space-between" wrap="nowrap">
              {step > 0 && step < lastStep ? (
                <Button
                  variant="subtle"
                  color="gray"
                  leftSection={<ArrowLeft size={15} />}
                  onClick={() => setStep((s) => s - 1)}
                  disabled={creating}
                >
                  Back
                </Button>
              ) : (
                <span />
              )}

              {step < lastStep ? (
                <Button
                  onClick={next}
                  loading={creating}
                  rightSection={<ArrowRight size={15} />}
                >
                  {step === lastStep - 1 ? (platform === "app" ? "Create app" : "Create site") : "Continue"}
                </Button>
              ) : (
                <Button leftSection={<Check size={15} />} onClick={close}>
                  Done
                </Button>
              )}
            </Group>
          </Box>
        </Box>
      </Group>
    </Modal>
  );
}
