import { useState } from "react";
import {
  ActionIcon, Badge, Button, Card, Center, Group, Loader, Modal, NumberInput, Stack, Switch, Table, Text, TextInput, Tooltip,
} from "@mantine/core";
import { Calculator, Pencil, Plus, Tag, Trash2 } from "lucide-react";
import {
  useDeleteAdminCouponMutation, useGetAdminCouponsQuery, useGetAdminPlansQuery, useSaveAdminCouponMutation,
} from "@/app/store";
import { notify, errMessage, confirmDelete } from "@/shared/lib/notify";
import type { Coupon } from "@/shared/types";
import { AdminSection } from "../layout/AdminSection";
import { AdminRefreshButton } from "../layout/AdminRefreshButton";
import { CouponPreview } from "../billing/CouponPreview";

const EMPTY: Partial<Coupon> = { code: "", percentOff: 10, active: true, expiresAt: null };

function couponStatus(c: Coupon): { label: string; color: string } {
  if (!c.active) return { label: "Paused", color: "gray" };
  if (c.expiresAt && new Date(c.expiresAt).getTime() < Date.now()) return { label: "Expired", color: "red" };
  return { label: "Active", color: "teal" };
}

export default function CouponsPanel() {
  const { data: coupons = [], isLoading, isFetching, refetch } = useGetAdminCouponsQuery();
  const { data: plans = [] } = useGetAdminPlansQuery();
  const [save, { isLoading: saving }] = useSaveAdminCouponMutation();
  const [remove] = useDeleteAdminCouponMutation();

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Partial<Coupon>>(EMPTY);
  const [preview, setPreview] = useState<Coupon | null>(null);

  const openNew = () => { setDraft(EMPTY); setOpen(true); };
  const openEdit = (c: Coupon) => { setDraft(c); setOpen(true); };

  const submit = async () => {
    try {
      await save(draft).unwrap();
      notify.success(`${draft.code} saved.`, draft._id ? "Coupon updated" : "Coupon created");
      setOpen(false);
    } catch (e) {
      notify.error(errMessage(e, "Could not save the coupon."));
    }
  };

  const askDelete = (c: Coupon) =>
    confirmDelete({
      title: `Delete ${c.code}?`,
      body: "Anyone with this code will no longer be able to apply it. Past orders that used it are unaffected.",
      onConfirm: async () => {
        try {
          await remove(c._id).unwrap();
          notify.success(`${c.code} deleted.`);
        } catch (e) {
          notify.error(errMessage(e, "Could not delete the coupon."));
        }
      },
    });

  return (
    <AdminSection
      id="coupons"
      actions={
        <>
          <AdminRefreshButton onClick={refetch} loading={isFetching} />
          <Button size="sm" radius="md" color="emerald" leftSection={<Plus size={15} />} onClick={openNew}>
            New coupon
          </Button>
        </>
      }
    >
      {isLoading ? (
        <Center py={64}><Loader size="sm" /></Center>
      ) : (
        <Card withBorder radius="lg" padding={0}>
          <Table.ScrollContainer minWidth={560}>
            <Table verticalSpacing="md" horizontalSpacing="lg" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Code</Table.Th>
                  <Table.Th>Discount</Table.Th>
                  <Table.Th>Expires</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {coupons.map((c) => {
                  const status = couponStatus(c);
                  return (
                    <Table.Tr key={c._id}>
                      <Table.Td>
                        <Badge size="md" variant="light" color="gray" tt="none" leftSection={<Tag size={11} />}>{c.code}</Badge>
                      </Table.Td>
                      <Table.Td><Text size="sm" fw={600}>{c.percentOff}% off</Text></Table.Td>
                      <Table.Td>
                        <Text size="sm" c={c.expiresAt ? undefined : "dimmed"}>
                          {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge size="sm" variant="light" color={status.color} tt="none">{status.label}</Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={4} justify="flex-end" wrap="nowrap">
                          <Tooltip label="Try it on a plan price" withArrow>
                            <ActionIcon variant="subtle" color="gray" onClick={() => setPreview(c)} aria-label={`Try ${c.code}`}>
                              <Calculator size={15} />
                            </ActionIcon>
                          </Tooltip>
                          <ActionIcon variant="subtle" color="gray" onClick={() => openEdit(c)} aria-label={`Edit ${c.code}`}>
                            <Pencil size={15} />
                          </ActionIcon>
                          <ActionIcon variant="subtle" color="red" onClick={() => askDelete(c)} aria-label={`Delete ${c.code}`}>
                            <Trash2 size={15} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
                {!coupons.length && (
                  <Table.Tr>
                    <Table.Td colSpan={5}><Text size="sm" c="dimmed" py="md">No coupons yet.</Text></Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Card>
      )}

      <CouponPreview coupon={preview} plans={plans} onClose={() => setPreview(null)} />

      <Modal opened={open} onClose={() => setOpen(false)} title={draft._id ? "Edit coupon" : "New coupon"} radius="lg" centered>
        <Stack gap="sm">
          <TextInput
            label="Code"
            description="What customers type at checkout. Letters and numbers, no spaces."
            value={draft.code}
            onChange={(e) => setDraft({ ...draft, code: e.currentTarget.value.toUpperCase() })}
            placeholder="SAVE20"
          />
          <NumberInput
            label="Discount"
            value={draft.percentOff}
            onChange={(v) => setDraft({ ...draft, percentOff: Number(v) || 1 })}
            min={1}
            max={100}
            suffix="% off"
          />
          <TextInput
            label="Expires"
            description="Leave empty for a code that never expires."
            type="date"
            value={draft.expiresAt ? new Date(draft.expiresAt).toISOString().slice(0, 10) : ""}
            onChange={(e) => setDraft({ ...draft, expiresAt: e.currentTarget.value || null })}
          />
          <Switch
            label="Active"
            checked={draft.active !== false}
            onChange={(e) => setDraft({ ...draft, active: e.currentTarget.checked })}
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setOpen(false)}>Cancel</Button>
            <Button color="emerald" loading={saving} onClick={submit}>Save coupon</Button>
          </Group>
        </Stack>
      </Modal>
    </AdminSection>
  );
}
