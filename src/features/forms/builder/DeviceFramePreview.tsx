import { useState } from "react";
import {
  Button, Card, Center, SegmentedControl, Select, Stack, Text, TextInput, Textarea, Switch,
} from "@mantine/core";
import { Laptop, Smartphone, Tablet } from "lucide-react";
import { useGetFormThemesQuery } from "@/app/store";
import type { FormField, FormSettings } from "@/shared/types";

type Device = "desktop" | "tablet" | "mobile";

const DEVICE_WIDTH: Record<Device, number> = {
  desktop: 420,
  tablet: 340,
  mobile: 280,
};

export function DeviceFramePreview({
  name, fields, settings,
}: {
  name: string;
  fields: FormField[];
  settings: FormSettings;
}) {
  const [device, setDevice] = useState<Device>("desktop");
  const { data: themes } = useGetFormThemesQuery();
  const preset = themes?.find((t) => t.slug === (settings.theme ?? "default"));

  const backgroundColor = settings.themeOverrides?.backgroundColor ?? preset?.backgroundColor;
  const fontFamily = settings.themeOverrides?.fontFamily ?? preset?.fontFamily;
  // Per-form primaryColor (already a V1 setting) wins over the preset, same
  // as the hosted page — a form that already picked a color keeps it.
  const primaryColor = settings.primaryColor || settings.themeOverrides?.primaryColor || preset?.primaryColor;

  return (
    <Stack gap="sm">
      <Center>
        <SegmentedControl
          size="xs"
          value={device}
          onChange={(v) => setDevice(v as Device)}
          data={[
            { value: "desktop", label: <Laptop size={14} /> },
            { value: "tablet", label: <Tablet size={14} /> },
            { value: "mobile", label: <Smartphone size={14} /> },
          ]}
        />
      </Center>
      <Center>
        <div
          style={{
            width: DEVICE_WIDTH[device],
            maxWidth: "100%",
            border: "1px solid var(--mantine-color-default-border)",
            borderRadius: "var(--mantine-radius-lg)",
            padding: 10,
            background: "var(--mantine-color-body)",
            boxShadow: "var(--mantine-shadow-sm)",
            transition: "width 0.15s ease",
          }}
        >
          <Card
            radius="md"
            padding="lg"
            style={{ backgroundColor, fontFamily, boxShadow: "none" }}
          >
            <Text fw={600} c="dimmed" size="sm" mb="md">Live preview</Text>
            <Stack gap="sm">
              {settings.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.logoUrl} alt="" style={{ height: 32, objectFit: "contain" }} />
              )}
              <Text fw={700} size="lg">{name || "Untitled form"}</Text>
              {fields.map((f) => (
                <PreviewField key={f.key} field={f} />
              ))}
              <Button
                fullWidth
                mt="sm"
                style={primaryColor ? { backgroundColor: primaryColor } : undefined}
                disabled
              >
                {settings.submitText || "Submit"}
              </Button>
            </Stack>
          </Card>
        </div>
      </Center>
    </Stack>
  );
}

function PreviewField({ field }: { field: FormField }) {
  const label = `${field.label}${field.required ? " *" : ""}`;
  switch (field.type) {
    case "textarea":
      return <Textarea label={label} placeholder={field.label} disabled autosize minRows={2} />;
    case "select":
      return <Select label={label} placeholder="Select…" data={field.options ?? []} disabled />;
    case "radio":
      return (
        <Stack gap={4}>
          <Text size="sm">{label}</Text>
          {(field.options ?? []).map((o) => (
            <Text key={o} size="xs" c="dimmed">○ {o}</Text>
          ))}
        </Stack>
      );
    case "checkbox":
      return <Switch label={label} disabled />;
    default:
      return <TextInput label={label} placeholder={field.label} type={field.type === "number" ? "number" : field.type} disabled />;
  }
}
