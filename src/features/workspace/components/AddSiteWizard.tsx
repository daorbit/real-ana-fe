import { useState } from "react";
import {
  Modal, Stack, Group, Button, TextInput, Switch, Divider, Text,
  Code, ThemeIcon, Box, ActionIcon, ScrollArea, UnstyledButton, SimpleGrid,
  SegmentedControl,
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
import { trace } from "@/shared/lib/analytics";
import { useAuth } from "@/features/auth/context";
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

/**
 * The two things a site can be, as data.
 *
 * The bullets matter more than the labels here: "web app" and "app" are the
 * same words to most people, and what actually separates them is whether
 * visitors are anonymous or signed in — so each card says that outright
 * rather than leaving it to be discovered on the next step.
 */
const PLATFORM_CHOICES = [
  {
    id: "web" as const,
    icon: Globe,
    title: "Website or landing page",
    blurb: "One script tag in the head. Starts collecting immediately.",
    points: [
      "Anonymous visitors — no cookie banner needed",
      "Pageviews, clicks, referrers and Core Web Vitals",
      "Best for marketing sites, blogs, docs",
    ],
  },
  {
    id: "app" as const,
    icon: Smartphone,
    title: "App with signed-in users",
    blurb: "A trace() call on the actions that matter, tied to your own user ids.",
    points: [
      "Per-user journeys you can open and replay",
      "Works for web apps and React Native alike",
      "Best for products behind a login",
    ],
  },
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
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [createSite, { isLoading: creating }] = useCreateSiteMutation();

  // step 0 — platform
  const [platform, setPlatform] = useState<Platform>("web");
  // step 1 (app only) — is it a web app or a mobile app? Decides whether the
  // identity fields ask for a URL or a bundle id, since "App" alone doesn't
  // say which — a web app tracked identified-style still lives at a URL.
  const [appKind, setAppKind] = useState<"web" | "mobile">("mobile");

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
    setAppKind("mobile");
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

    if (appKind === "web") {
      // A web app is still a real URL, even though it's tracked
      // identified-style instead of anonymously — same validator as the web
      // platform's domain field.
      const dErr = v.domain(domain);
      setDomainError(dErr);
      setBundleIdError(null);
      return !nErr && !dErr;
    }

    // Bundle id is optional context (shown on the site card), not a tracking
    // key, so it isn't validated against a format — teams name these
    // differently across iOS/Android and a wrong guess here blocks nothing.
    setDomainError(null);
    setBundleIdError(null);
    return !nErr;
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
        <Stack gap="xl" className="wizard-choice" align="center">
          <Stack gap={6} align="center" maw={520}>
            <Text fz={26} fw={700} style={{ letterSpacing: "-0.02em" }}>
              What are you tracking?
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              This decides which install guide you get. Either way the events
              land in the same dashboard.
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" w="100%" maw={720}>
            {PLATFORM_CHOICES.map((choice) => {
              const on = platform === choice.id;
              return (
                <UnstyledButton
                  key={choice.id}
                  className="wizard-choice-card"
                  data-selected={on || undefined}
                  aria-pressed={on}
                  onClick={() => setPlatform(choice.id)}
                >
                  <Group justify="space-between" wrap="nowrap" mb="md">
                    <ThemeIcon
                      size={44}
                      radius="md"
                      variant={on ? "filled" : "light"}
                      color={on ? "emerald" : "gray"}
                    >
                      <choice.icon size={22} />
                    </ThemeIcon>
                    {on && (
                      <ThemeIcon size={22} radius="xl" color="emerald">
                        <Check size={13} />
                      </ThemeIcon>
                    )}
                  </Group>

                  <Text fw={650} size="md" mb={4}>{choice.title}</Text>
                  <Text size="sm" c="dimmed" lh={1.5} mb="md">{choice.blurb}</Text>

                  <Stack gap={6}>
                    {choice.points.map((point) => (
                      <Group key={point} gap={8} wrap="nowrap" align="flex-start">
                        <Box className="wizard-choice-dot" />
                        <Text size="xs" c="dimmed" lh={1.5}>{point}</Text>
                      </Group>
                    ))}
                  </Stack>
                </UnstyledButton>
              );
            })}
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

      {/* App identity: name plus either a URL (web app) or a bundle id
          (mobile app) — "App" alone doesn't say which, and a web app tracked
          identified-style still lives at a real URL, so it needs the same
          field a mobile app has no use for. */}
      {step === 1 && platform === "app" && (
        <Stack gap="md" maw={480}>
          <div>
            <Text size="sm" fw={500} mb={6}>Is this a web app or a mobile app?</Text>
            <SegmentedControl
              value={appKind}
              onChange={(v2) => setAppKind(v2 as "web" | "mobile")}
              data={[
                { label: "Web app", value: "web" },
                { label: "Mobile app", value: "mobile" },
              ]}
              fullWidth
            />
          </div>

          <TextInput
            label="App name"
            placeholder="e.g. Quantalog mobile"
            description="Only used to identify this app in your dashboard."
            value={name}
            onChange={(e) => { setName(e.currentTarget.value); setNameError(null); }}
            error={nameError}
            data-autofocus
          />

          {appKind === "web" ? (
            <TextInput
              label="App URL"
              placeholder="app.yourcompany.com"
              description="Where the app is hosted. Paste a full URL if it's easier."
              leftSection={<Globe size={15} />}
              value={domain}
              onChange={(e) => { setDomain(e.currentTarget.value); setDomainError(null); }}
              error={domainError}
            />
          ) : (
            <TextInput
              label="Bundle id / package name"
              placeholder="com.yourcompany.app"
              description="Optional — shown on the app's card so you can tell two apps apart at a glance."
              leftSection={<Smartphone size={15} />}
              value={bundleId}
              onChange={(e) => { setBundleId(e.currentTarget.value); setBundleIdError(null); }}
              error={bundleIdError}
            />
          )}
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

          {mobileSteps(created.siteId, API_ORIGIN, appKind).map((s) => (
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
