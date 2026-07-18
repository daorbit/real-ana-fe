import { useState } from "react";
import {
  Modal, Stepper, Stack, Group, Button, TextInput, Switch, Divider, Text,
  Code, ThemeIcon, Box, SimpleGrid, UnstyledButton,
} from "@mantine/core";
import { ArrowLeft, ArrowRight, Check, Globe, PartyPopper } from "lucide-react";
import { CodeBlock } from "./CodeBlock";
import { InstallCheck } from "./InstallCheck";
import { BrandIcon } from "./BrandIcon";
import { useCreateSiteMutation } from "../store";
import { type TrackerOptions } from "../utils";
import {
  FRAMEWORKS, getFramework, frameworkLanguage, type FrameworkId,
} from "../utils/frameworks";
import * as v from "../utils/validate";
import { notify, errMessage } from "../notify";
import type { Site } from "../types";

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
        notify.error(errMessage(err, "Could not add the site."));
      }
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      title="Add a site"
      centered
      radius="lg"
      size="lg"
      // Closing mid-flow after the site exists would strand the snippet, so the
      // last step must be dismissed deliberately.
      closeOnClickOutside={step < 2}
    >
      <Stepper active={step} size="sm" color="emerald" iconSize={30} mb="xl">
        <Stepper.Step label="Site" description="Name and domain" />
        <Stepper.Step label="Tracking" description="How it collects" />
        <Stepper.Step label="Install" description="Copy the snippet" />
      </Stepper>

      {step === 0 && (
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

          <div>
            <Text size="sm" fw={500} mb={4}>What is it built with?</Text>
            <Text size="xs" c="dimmed" mb="xs">
              Only changes the install instructions you get at the end — the
              tracker itself is the same everywhere.
            </Text>
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
              {FRAMEWORKS.map((f) => (
                <UnstyledButton
                  key={f.id}
                  className="onb-fw tile"
                  data-selected={framework === f.id}
                  aria-pressed={framework === f.id}
                  onClick={() => setFramework(f.id)}
                >
                  <BrandIcon framework={f.id} size={22} />
                  <Text size="sm" fw={framework === f.id ? 600 : 500}>
                    {f.label}
                  </Text>
                </UnstyledButton>
              ))}
            </SimpleGrid>
          </div>
        </Stack>
      )}

      {step === 1 && (
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            These become attributes on your script tag. Every one is optional —
            the defaults are what most sites want.
          </Text>

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

          <Divider />

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

      <Group justify="space-between" mt="xl">
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
    </Modal>
  );
}
