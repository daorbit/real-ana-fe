import { useState } from "react";
import {
  Modal, Stack, Group, Button, TextInput, Switch, Divider, Text,
  Code, ThemeIcon, Box, ActionIcon, ScrollArea,
} from "@mantine/core";
import {
  ArrowLeft, ArrowRight, Check, Globe, PartyPopper, X, Settings2, Code2,
} from "lucide-react";
import { CodeBlock } from "@/shared/ui/CodeBlock";
import { InstallCheck } from "@/features/workspace/components/InstallCheck";
import { useCreateSiteMutation } from "@/app/store";
import { type TrackerOptions } from "@/features/workspace";
import {
  getFramework, frameworkLanguage, type FrameworkId,
} from "@/features/workspace/frameworks";
import { FrameworkPicker } from "@/features/workspace/components/FrameworkPicker";
import * as v from "@/shared/lib/validate";
import { notify, notifyError } from "@/shared/lib/notify";
import type { Site } from "@/shared/types";

/** The three stops, in order, as the rail draws them. */
const STEPS = [
  { label: "Site", description: "Name and domain", icon: Globe },
  { label: "Tracking", description: "How it collects", icon: Settings2 },
  { label: "Install", description: "Copy the snippet", icon: Code2 },
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

  // step 1 — identity
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [framework, setFramework] = useState<FrameworkId>("html");
  const [nameError, setNameError] = useState<string | null>(null);
  const [domainError, setDomainError] = useState<string | null>(null);

  // step 2 — options
  const [dnt, setDnt] = useState(false);
  const [hash, setHash] = useState(false);
  const [clicks, setClicks] = useState(true);
  const [errors, setErrors] = useState(true);
  const [ignorePages, setIgnorePages] = useState("");
  const [allowParams, setAllowParams] = useState("");
  const [reportDomain, setReportDomain] = useState("");

  // step 3 — result
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

  const reset = () => {
    setStep(0);
    setName("");
    setDomain("");
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

  const close = () => {
    onClose();
    // Let the modal finish animating out before the contents snap back.
    setTimeout(reset, 200);
  };

  const validateStep1 = () => {
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

  const next = async () => {
    if (step === 0) {
      if (validateStep1()) setStep(1);
      return;
    }

    if (step === 1) {
      // The site is created on leaving step 2, so the snippet on step 3 is the
      // real one for a real siteId rather than a preview to be re-copied later.
      try {
        const site = await createSite({
          workspaceId,
          name: name.trim(),
          domain: v.normalizeDomain(domain),
          framework,
          trackerOptions: options,
        }).unwrap();
        setCreated(site);
        setStep(2);
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
      closeOnClickOutside={step < 2}
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
        <Text fw={600}>Add a site</Text>
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
            {/* The last step is a snippet to read, which wants a single narrow
                column; the two before it are forms laid out in two. */}
            <Box className="wizard-body" data-wide={step < 2}>

      {/* Two columns: the two text fields on the left, the framework grid on
          the right. Stacked, the grid pushed the fields off the top of a wide
          window and left the space either side of them empty — side by side
          the whole step fits without scrolling. */}
      {step === 0 && (
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

      {step === 1 && (
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

      {step === 2 && created && (
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

            </Box>
          </ScrollArea>

          {/* The footer stays put while the body scrolls, so the way forward is
              never something you have to scroll to find. */}
          <Box className="wizard-foot">
            <Group justify="space-between" wrap="nowrap">
              {step > 0 && step < 2 ? (
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

              {step < 2 ? (
                <Button
                  onClick={next}
                  loading={creating}
                  rightSection={<ArrowRight size={15} />}
                >
                  {step === 1 ? "Create site" : "Continue"}
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
