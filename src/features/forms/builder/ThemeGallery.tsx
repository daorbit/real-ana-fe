import { Center, Loader, Modal, SimpleGrid, Stack, Text } from "@mantine/core";
import { Check } from "lucide-react";
import { useGetFormThemesQuery } from "@/app/store";

export function ThemeGallery({
  opened, onClose, value, onSelect,
}: {
  opened: boolean;
  onClose: () => void;
  value: string;
  onSelect: (slug: string) => void;
}) {
  const { data: themes, isLoading } = useGetFormThemesQuery();

  return (
    <Modal opened={opened} onClose={onClose} title="Choose a theme" size="lg">
      {isLoading || !themes ? (
        <Center py="xl"><Loader size="sm" /></Center>
      ) : (
        <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md">
          {themes.map((theme) => {
            const selected = theme.slug === value;
            return (
              <button
                key={theme.slug}
                type="button"
                className={selected ? "theme-card active" : "theme-card"}
                style={{
                  border: "1px solid var(--mantine-color-default-border)",
                  borderRadius: "var(--mantine-radius-md)",
                  padding: 0,
                  overflow: "hidden",
                  background: "var(--mantine-color-body)",
                  textAlign: "left",
                }}
                onClick={() => {
                  onSelect(theme.slug);
                  onClose();
                }}
              >
                {/* A miniature mock of the hosted form rendered in this
                    theme's tokens — reads as a real preview, not a flat
                    color chip. */}
                <div
                  style={{
                    height: 72,
                    background: theme.backgroundColor,
                    padding: 10,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    position: "relative",
                  }}
                >
                  <div style={{ width: "60%", height: 6, borderRadius: 3, background: "rgba(0,0,0,0.18)" }} />
                  <div style={{ width: "85%", height: 5, borderRadius: 3, background: "rgba(0,0,0,0.1)" }} />
                  <div style={{ width: "70%", height: 5, borderRadius: 3, background: "rgba(0,0,0,0.1)" }} />
                  <div style={{ marginTop: "auto", width: "45%", height: 10, borderRadius: 4, background: theme.primaryColor }} />
                  {selected && (
                    <div
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        width: 18,
                        height: 18,
                        borderRadius: 999,
                        background: "var(--mantine-color-emerald-6)",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <Check size={12} color="white" />
                    </div>
                  )}
                </div>
                <Stack gap={0} p="xs">
                  <Text size="xs" fw={600}>{theme.name}</Text>
                </Stack>
              </button>
            );
          })}
        </SimpleGrid>
      )}
    </Modal>
  );
}
