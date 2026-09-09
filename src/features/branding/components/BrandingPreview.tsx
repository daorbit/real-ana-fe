import { useState } from "react";
import { Box, Text, Stack, Group, SegmentedControl } from "@mantine/core";
import { DeviceFrame, frameSize } from "@/features/social/components/DeviceFrame";
import { useFitScale } from "@/hooks/useFitScale";

interface Props {
  /** What the fields currently say — the unsaved draft, not what is stored. */
  name: string;
  logoUrl: string;
  accentColor: string;
  showPoweredBy: boolean;
  poweredByLabel: string;
  /** Ours, shown wherever the workspace has set nothing. */
  fallbackName: string;
  fallbackLogo?: string;
}

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

/** A labelled box standing in for an input the respondent would type into. */
function FieldRow({ label }: { label: string }) {
  return (
    <Box>
      <Text size="10px" fw={600} c="#4b5563" mb={5}>
        {label}
      </Text>
      <Box
        style={{
          height: 30,
          borderRadius: 7,
          border: "1px solid #e5e7eb",
          background: "#f9fafb",
        }}
      />
    </Box>
  );
}

/**
 * A phone-sized mock of what this branding produces.
 *
 * Two surfaces, because they fail differently: a logo that is the wrong shape
 * shows up on the form, while an accent that disappears against white shows up
 * on the payment window. Both are somewhere else in the product, so neither is
 * seen while the fields that decide them are being typed.
 *
 * Deliberately approximate. It is a likeness, not the real renderer: keeping
 * the actual public form in step would mean importing it whole, and a preview
 * that lags a detail beats a settings page that cannot load.
 */
export function BrandingPreview({
  name,
  logoUrl,
  accentColor,
  showPoweredBy,
  poweredByLabel,
  fallbackName,
  fallbackLogo,
}: Props) {
  const [surface, setSurface] = useState<"form" | "payment">("form");
  const size = frameSize("iphone");
  const { ref: stageRef, scale, measured } = useFitScale({
    contentWidth: size.width,
    contentHeight: size.height,
    padding: { x: 8, y: 8 },
  });

  // Empty fields preview the fallback, which is what would actually render —
  // a blank header would be previewing a state that never ships.
  const shownName = name.trim() || fallbackName;
  const shownLogo = logoUrl.trim() || fallbackLogo;
  const accent = accentColor.trim() || "#4f46e5";

  const brandHeader = (
    <Group gap={10} align="center">
      {shownLogo && (
        <img
          src={shownLogo}
          alt=""
          style={{
            width: 30,
            height: 30,
            borderRadius: 7,
            objectFit: "contain",
            background: "#f3f4f6",
          }}
        />
      )}
      <Text fw={700} size="sm" c="#111827" style={{ letterSpacing: "-0.2px" }}>
        {shownName}
      </Text>
    </Group>
  );

  return (
    <Box style={{ display: "flex", flexDirection: "column" }}>
      <SegmentedControl
        fullWidth
        size="xs"
        value={surface}
        onChange={(v) => setSurface(v as "form" | "payment")}
        data={[
          { value: "form", label: "Form" },
          { value: "payment", label: "Payment" },
        ]}
      />
      <Text size="xs" c="dimmed" ta="center" mt={6} mb={8}>
        approximate
      </Text>

      {/* An explicit height rather than `flex: 1`: the stage is what
          `useFitScale` measures, so it needs a size of its own — in a card
          that hugs its content there is nothing above it to divide up. */}
      <Box
        ref={stageRef}
        style={{
          // Capped against the viewport as well as fixed: on a short window a
          // 520px stage plus the page header is what pushes the card past the
          // fold and leaves the gap below it.
          height: "min(520px, 60vh)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <DeviceFrame device="iphone" scale={scale} hidden={!measured}>
          {surface === "form" ? (
            <Box
              style={{
                height: "100%",
                background: "#f5f6f8",
                padding: "0 18px",
                // Centred rather than top-aligned: a short form sitting under a
                // screen of empty white previews a page nobody will see.
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                fontFamily: FONT,
              }}
            >
              <Box
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  border: "1px solid #e5e7eb",
                  padding: 18,
                }}
              >
                <Stack gap={14}>
                  {brandHeader}
                  <FieldRow label="Your name" />
                  <FieldRow label="Email" />

                  {/* The accent's real job — the one element it colours, and
                      where a washed-out choice becomes obvious. */}
                  <Box
                    style={{
                      height: 34,
                      borderRadius: 8,
                      background: accent,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text size="11px" fw={600} c="#fff">
                      Submit
                    </Text>
                  </Box>
                </Stack>
              </Box>

              {showPoweredBy && (
                <Text size="9px" c="#6b7280" ta="center" mt={14}>
                  {poweredByLabel}
                </Text>
              )}
            </Box>
          ) : (
            /* The gateway's own window, which is why it is not themed like the
               form: the respondent has left our page by this point, and the
               only thing we control is the name, the mark and the colour. */
            <Box
              style={{
                height: "100%",
                background: "#fff",
                display: "flex",
                flexDirection: "column",
                fontFamily: FONT,
              }}
            >
              <Box style={{ background: accent, padding: "22px 18px 18px" }}>
                <Stack gap={10} align="center">
                  {shownLogo ? (
                    <img
                      src={shownLogo}
                      alt=""
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 9,
                        objectFit: "contain",
                        background: "#fff",
                        padding: 3,
                      }}
                    />
                  ) : (
                    <Box
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 9,
                        background: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text fw={700} size="lg" c={accent}>
                        {shownName.charAt(0).toUpperCase()}
                      </Text>
                    </Box>
                  )}
                  <Text fw={700} size="sm" c="#fff">
                    {shownName}
                  </Text>
                  <Box
                    style={{
                      background: "rgba(255,255,255,0.18)",
                      borderRadius: 8,
                      padding: "6px 14px",
                    }}
                  >
                    <Text size="11px" fw={600} c="#fff">
                      ₹500
                    </Text>
                  </Box>
                </Stack>
              </Box>

              {/* Fills the rest of the screen, so the mock ends where the
                  phone does rather than trailing off into white. */}
              <Box
                style={{
                  flex: 1,
                  minHeight: 0,
                  padding: "16px 18px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Text size="10px" fw={600} c="#4b5563" mb={10}>
                  Payment options
                </Text>
                <Stack gap={8}>
                  {["UPI", "Cards", "Netbanking", "Wallet", "Pay Later"].map((method) => (
                    <Box
                      key={method}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        padding: "9px 12px",
                      }}
                    >
                      <Text size="10px" c="#111827">
                        {method}
                      </Text>
                    </Box>
                  ))}
                </Stack>

                {/* The gateway's own footer sits at the bottom of its window. */}
                <Text size="9px" c="#9ca3af" ta="center" mt="auto">
                  Secured by Razorpay
                </Text>
              </Box>
            </Box>
          )}
        </DeviceFrame>
      </Box>
    </Box>
  );
}
