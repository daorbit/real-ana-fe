import { useState, type ReactNode } from "react";
import {
  ActionIcon, Badge, Button, Card, Center, Group, Loader, Modal, NumberInput, Select, Stack, Switch, Table, Text, TextInput,
} from "@mantine/core";
import { CalendarClock, ClipboardList, Globe2, Images, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import {
  useDeleteAdminAddonPackMutation, useGetAdminAddonPacksQuery, useSaveAdminAddonPackMutation,
} from "@/app/store";
import { notify, errMessage, confirmDelete } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";
import { useAuth } from "@/features/auth/context";
import type { AddonPack, AddonType, CurrencyPrices } from "@/shared/types";
import { AdminSection } from "../layout/AdminSection";
import { AdminRefreshButton } from "../layout/AdminRefreshButton";
import { CurrencyPriceInputs } from "../billing/CurrencyPriceInputs";
import { emptyPrices, moneyList, toMajor, toMinor } from "../billing/billingFormat";
import classes from "@/features/admin/components/Admin.module.css";

const TYPE_ICON: Record<AddonType, ReactNode> = {
  audit: <Search size={11} />,
  crawl: <Globe2 size={11} />,
  orbit: <OrbitMark size={11} />,
  "post-slots": <CalendarClock size={11} />,
  "form-submissions": <ClipboardList size={11} />,
  "media-slots": <Images size={11} />,
};

const TYPE_OPTIONS: { value: AddonType; label: string }[] = [
  { value: "audit", label: "SEO audits" },
  { value: "crawl", label: "Site crawls" },
  { value: "orbit", label: "Orbit AI questions" },
  { value: "post-slots", label: "Scheduled post slots" },
  { value: "form-submissions", label: "Form responses" },
  { value: "media-slots", label: "Media library slots" },
];

const TYPE_LABEL = Object.fromEntries(TYPE_OPTIONS.map((o) => [o.value, o.label])) as Record<AddonType, string>;

const EMPTY: Partial<AddonPack> = {
  name: "", slug: "", type: "audit", quantity: 10, price: emptyPrices(), active: true, sortOrder: 0,
};

export default function AddonsPanel() {
  const { user } = useAuth();
  const { data: addons = [], isLoading, isFetching, refetch } = useGetAdminAddonPacksQuery();
  const [save, { isLoading: saving }] = useSaveAdminAddonPackMutation();
  const [remove] = useDeleteAdminAddonPackMutation();

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Partial<AddonPack>>(EMPTY);
  const [price, setPrice] = useState<CurrencyPrices>(emptyPrices);

  const openNew = () => { setDraft(EMPTY); setPrice(emptyPrices()); setOpen(true); };
  const openEdit = (a: AddonPack) => { setDraft(a); setPrice(toMajor(a.price)); setOpen(true); };

  const submit = async () => {
    trace(user?.id, draft._id ? "update_addon_pack" : "create_addon_pack", "admin_billing", "admin_billing");
    try {
      await save({ ...draft, price: toMinor(price) }).unwrap();
      notify.success(`${draft.name} saved.`, draft._id ? "Add-on updated" : "Add-on created");
      setOpen(false);
    } catch (e) {
      notify.error(errMessage(e, "Could not save the add-on."));
    }
  };

  const askDelete = (a: AddonPack) =>
    confirmDelete({
      title: `Delete ${a.name}?`,
      body: "Purchases already made are unaffected. This only removes it from the Billing page.",
      onConfirm: async () => {
        trace(user?.id, "delete_addon_pack", "admin_billing", "admin_billing");
        try {
          await remove(a._id).unwrap();
          notify.success(`${a.name} deleted.`);
        } catch (e) {
          notify.error(errMessage(e, "Could not delete the add-on."));
        }
      },
    });

  return (
    <AdminSection
      id="addons"
      actions={
        <>
          <AdminRefreshButton onClick={refetch} loading={isFetching} />
          <Button size="sm" radius="md" color="emerald" leftSection={<Plus size={15} />} onClick={openNew}>
            New add-on pack
          </Button>
        </>
      }
    >
      {isLoading ? (
        <Center py={64}><Loader size="sm" /></Center>
      ) : (
        <Card withBorder radius="lg" padding={0}>
          <Table.ScrollContainer minWidth={640}>
            <Table verticalSpacing="md" horizontalSpacing="lg" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Pack</Table.Th>
                  <Table.Th>Gives</Table.Th>
                  <Table.Th>Price</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {addons.map((a) => (
                  <Table.Tr key={a._id}>
                    <Table.Td><Text size="sm" fw={600}>{a.name}</Text></Table.Td>
                    <Table.Td>
                      <Badge size="md" variant="light" color="gray" tt="none" leftSection={TYPE_ICON[a.type]}>
                        {a.quantity} · {TYPE_LABEL[a.type]}
                      </Badge>
                    </Table.Td>
                    <Table.Td><Text size="sm">{moneyList(a.price)}</Text></Table.Td>
                    <Table.Td>
                      <Badge size="sm" variant="light" color={a.active ? "teal" : "gray"} tt="none">
                        {a.active ? "On sale" : "Hidden"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4} justify="flex-end" wrap="nowrap">
                        <ActionIcon variant="subtle" color="gray" onClick={() => openEdit(a)} aria-label={`Edit ${a.name}`}>
                          <Pencil size={15} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="red" onClick={() => askDelete(a)} aria-label={`Delete ${a.name}`}>
                          <Trash2 size={15} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
                {!addons.length && (
                  <Table.Tr>
                    <Table.Td colSpan={5}><Text size="sm" c="dimmed" py="md">No add-on packs yet.</Text></Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Card>
      )}

      <Modal opened={open} onClose={() => setOpen(false)} title={draft._id ? "Edit add-on pack" : "New add-on pack"} radius="lg" centered>
        <Stack gap="sm">
          <div className={classes.formRow}>
            <TextInput label="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.currentTarget.value })} placeholder="+10 audits" />
            <TextInput label="Slug" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.currentTarget.value })} placeholder="audits-10" />
          </div>
          <div className={classes.formRow}>
            <Select
              label="Type"
              value={draft.type}
              onChange={(v) => setDraft({ ...draft, type: (v as AddonType) ?? "audit" })}
              data={TYPE_OPTIONS}
            />
            <NumberInput label="Quantity" value={draft.quantity} onChange={(v) => setDraft({ ...draft, quantity: Number(v) || 1 })} min={1} />
          </div>
          <CurrencyPriceInputs label="Price" values={price} onChange={setPrice} />
          <Switch
            label="On sale (visible on the Billing page)"
            checked={draft.active !== false}
            onChange={(e) => setDraft({ ...draft, active: e.currentTarget.checked })}
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setOpen(false)}>Cancel</Button>
            <Button color="emerald" loading={saving} onClick={submit}>Save</Button>
          </Group>
        </Stack>
      </Modal>
    </AdminSection>
  );
}
