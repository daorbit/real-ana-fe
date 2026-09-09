import { useEffect, useState } from "react";
import {
  Text, Group, Button, Card, Stack, TextInput, Switch, Box,
  Alert, Badge, Divider, ColorInput, Grid, Input,
} from "@mantine/core";
import { Palette, Lock, TriangleAlert, Images } from "lucide-react";
import { useGetBrandingQuery, useUpdateBrandingMutation } from "@/app/store";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { EmptyState } from "@/shared/ui/EmptyState";
import { notify, errMessage } from "@/shared/lib/notify";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { useTitle } from "@/shared/lib/useTitle";
import { BrandingPreview } from "../components/BrandingPreview";
import { MediaPickerModal } from "@/features/media/components/MediaPickerModal";

/**
 * What the people a workspace collects from actually see.
 *
 * One screen rather than a setting per surface: the name on a payment window,
 * the caption under a public form and the footer of a notification email are
 * the same claim about who is asking, and splitting them is how a workspace
 * ends up half-rebranded.
 */
export default function BrandingPage() {
  useTitle("Branding");
  const { active } = useWorkspace();
  const { canAdmin } = usePermissions();
  const workspaceId = active?._id ?? "";

  const { data, isLoading } = useGetBrandingQuery(workspaceId, { skip: !workspaceId });
  const [save, { isLoading: saving }] = useUpdateBrandingMutation();

  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [accentColor, setAccentColor] = useState("");
  const [hidePoweredBy, setHidePoweredBy] = useState(false);
  // Whether the logo URL actually resolves. A broken link is worth saying here
  // rather than leaving someone to find a missing image on a payment window.
  const [logoBroken, setLogoBroken] = useState(false);
  const [picking, setPicking] = useState(false);

  // Seeded from what the workspace stored, not from the resolved values: a free
  // workspace's fields would otherwise fill with our own name, and saving would
  // silently adopt it as theirs.
  useEffect(() => {
    if (!data) return;
    setName(data.stored.name ?? "");
    setLogoUrl(data.stored.logoUrl ?? "");
    setAccentColor(data.stored.accentColor ?? "");
    setHidePoweredBy(data.stored.hidePoweredBy);
  }, [data]);

  useEffect(() => setLogoBroken(false), [logoUrl]);

  if (!active) {
    return (
      <AppShell>
        <EmptyState
          icon={Palette}
          title="No workspace selected"
          description="Choose a workspace from the switcher to set how its forms and payment windows are branded."
          action={{ label: "Go to workspaces", to: "/app/workspaces" }}
        />
      </AppShell>
    );
  }

  const editable = Boolean(data?.editable);
  const locked = !editable || !canAdmin;

  async function submit() {
    try {
      await save({
        workspaceId,
        name,
        logoUrl,
        accentColor,
        hidePoweredBy,
      }).unwrap();
      notify.success("Your forms and payment windows will use it.", "Branding saved");
    } catch (err) {
      notify.error(errMessage(err));
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Branding"
        description={`What people see when they fill in ${active.name}'s forms or pay through them.`}
        actions={
          <Button onClick={submit} loading={saving} disabled={locked || isLoading}>
            Save branding
          </Button>
        }
      />

      <Grid gap="lg" mt="md">
        <Grid.Col span={{ base: 12, lg: 8 }}>
      <Stack gap="lg">
        {!editable && (
          <Alert
            variant="light"
            color="violet"
            radius="md"
            icon={<Lock size={16} />}
            title="Custom branding is part of Pro"
          >
            <Text size="sm">
              Your forms, receipts and payment windows currently carry{" "}
              {data?.name ?? "Quantalog"}. On Pro you can put your own name and logo on
              them, and take the "{data?.poweredByLabel}" caption off.
            </Text>
            <Button
              component="a"
              href="/app/billing"
              size="xs"
              variant="light"
              color="violet"
              mt="sm"
            >
              See plans
            </Button>
          </Alert>
        )}

        {editable && !canAdmin && (
          <Alert variant="light" color="gray" radius="md" icon={<TriangleAlert size={16} />}>
            <Text size="sm">
              Branding is the workspace's public face, so only an admin can change it.
            </Text>
          </Alert>
        )}

        <Card withBorder radius="md" padding="lg">
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={600}>Your business</Text>
              {data && !editable && (
                <Badge variant="light" color="gray" size="sm">
                  Showing {data.name}
                </Badge>
              )}
            </Group>

            <TextInput
              label="Name"
              description="Shown on the payment window and under your forms."
              placeholder={data?.name ?? "Your business name"}
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              disabled={locked}
              maxLength={60}
            />

            {/* Picked from the library rather than typed: a logo is a file the
                workspace owns, and a pasted URL is one nobody can re-find when
                it breaks. */}
            <Input.Wrapper
              label="Logo"
              description="A square image. Razorpay loads it from the payer's browser."
              error={logoUrl && logoBroken ? "That image could not be loaded." : undefined}
            >
              <Group gap="sm" mt={6}>
                {/* The chosen file, at the size it is actually used. The phone
                    mock shows it in context; this says which file it is. */}
                {logoUrl && !logoBroken && (
                  <Box
                    style={{
                      width: 44,
                      height: 44,
                      flexShrink: 0,
                      borderRadius: "var(--mantine-radius-sm)",
                      border: "1px solid var(--mantine-color-default-border)",
                      background: "var(--mantine-color-default-hover)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={logoUrl}
                      alt=""
                      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    />
                  </Box>
                )}
                <Button
                  variant="default"
                  leftSection={<Images size={15} />}
                  onClick={() => setPicking(true)}
                  disabled={locked}
                >
                  {logoUrl ? "Change logo" : "Choose from media"}
                </Button>
                {logoUrl && (
                  <Button
                    variant="subtle"
                    color="gray"
                    onClick={() => setLogoUrl("")}
                    disabled={locked}
                  >
                    Remove
                  </Button>
                )}
              </Group>
            </Input.Wrapper>

            {/* A hidden <img> rather than a visible thumbnail: the phone mock
                beside these fields already shows the logo, but it only reports a
                failure if something is watching for one. */}
            {logoUrl && (
              <img
                src={logoUrl}
                alt=""
                hidden
                onError={() => setLogoBroken(true)}
                onLoad={() => setLogoBroken(false)}
              />
            )}

            <ColorInput
              label="Accent colour"
              description="Used where a gateway accepts a brand colour."
              placeholder="#4f46e5"
              value={accentColor}
              onChange={setAccentColor}
              disabled={locked}
              format="hex"
              withEyeDropper={false}
            />
          </Stack>
        </Card>

        <Card withBorder radius="md" padding="lg">
          <Stack gap="md">
            <Text fw={600}>Our caption</Text>
            <Divider />
            <Switch
              label={`Hide "${data?.poweredByLabel ?? "Powered by Quantalog Forms"}"`}
              description="Removes it from your public forms, thank-you screens and the emails your respondents get."
              checked={hidePoweredBy}
              onChange={(e) => setHidePoweredBy(e.currentTarget.checked)}
              disabled={locked}
            />
          </Stack>
        </Card>
      </Stack>
        </Grid.Col>

        {/* The preview is sticky: the fields below it are what change it, and
            scrolling to a colour picker should not scroll the thing it
            colours off the screen. */}
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Card
            withBorder
            radius="md"
            padding="md"
            // Tall enough for the phone and no taller: a fixed height left a
            // band of empty card under it on wide screens.
            style={{ position: "sticky", top: 16, height: "fit-content" }}
          >
            <BrandingPreview
              name={name}
              logoUrl={logoBroken ? "" : logoUrl}
              accentColor={accentColor}
              showPoweredBy={!(editable && hidePoweredBy)}
              poweredByLabel={data?.poweredByLabel ?? "Powered by Quantalog Forms"}
              fallbackName={data?.defaults.name ?? "Quantalog"}
              fallbackLogo={data?.defaults.logoUrl}
            />
          </Card>
        </Grid.Col>
      </Grid>

      <MediaPickerModal
        opened={picking}
        onClose={() => setPicking(false)}
        onPick={(asset) => setLogoUrl(asset.url)}
        kind="image"
        title="Choose a logo"
      />
    </AppShell>
  );
}
