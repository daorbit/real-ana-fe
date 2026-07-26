import { useState } from "react";
import {
  Title, Text, Group, Button, Card, Table, Badge, Modal, TextInput, NumberInput,
  Textarea, Stack, Switch, Tabs, ActionIcon, Center, Loader, Select,
} from "@mantine/core";
import { Plus, Pencil, Trash2, Search, Globe2 } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { PageHeader } from "../components/Page";
import {
  useGetAdminPlansQuery, useSaveAdminPlanMutation, useDeleteAdminPlanMutation,
  useGetAdminAddonPacksQuery, useSaveAdminAddonPackMutation, useDeleteAdminAddonPackMutation,
} from "../store";
import { notify, errMessage, confirmDelete } from "../notify";
import type { Plan, AddonPack, AddonType } from "../types";

function money(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

/**
 * Admin-only: create and edit the plans and addon packs sold on the Billing
 * page. Prices are entered in rupees here and converted to paise on save —
 * Razorpay's API and our own Plan/AddonPack schemas store paise, but nobody
 * types "99900" into a form by choice.
 */
export default function AdminBilling() {
  return (
    <AppShell>
      <PageHeader title="Plans & addons" description="Pricing and quotas admins can change without a deploy." />
      <Tabs defaultValue="plans" keepMounted={false}>
        <Tabs.List mb="lg">
          <Tabs.Tab value="plans">Plans</Tabs.Tab>
          <Tabs.Tab value="addons">Addon packs</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="plans"><PlansTab /></Tabs.Panel>
        <Tabs.Panel value="addons"><AddonsTab /></Tabs.Panel>
      </Tabs>
    </AppShell>
  );
}

/* ---------------------------------- plans ----------------------------------- */

const emptyPlan: Partial<Plan> = {
  name: "", slug: "", description: "",
  priceMonthly: 0, priceYearly: 0,
  razorpayPlanIdMonthly: "", razorpayPlanIdYearly: "",
  maxSites: 1, monthlyAuditQuota: 0, monthlyCrawlQuota: 0,
  features: [], active: true, sortOrder: 0,
};

function PlansTab() {
  const { data: plans = [], isLoading } = useGetAdminPlansQuery();
  const [save, { isLoading: saving }] = useSaveAdminPlanMutation();
  const [remove] = useDeleteAdminPlanMutation();

  const [modal, setModal] = useState(false);
  const [draft, setDraft] = useState<Partial<Plan>>(emptyPlan);

  const openNew = () => { setDraft(emptyPlan); setModal(true); };
  const openEdit = (p: Plan) => { setDraft(p); setModal(true); };

  const submit = async () => {
    try {
      await save({
        ...draft,
        priceMonthly: Math.round(Number(draft.priceMonthly ?? 0) * 100),
        priceYearly: Math.round(Number(draft.priceYearly ?? 0) * 100),
        features: (draft.features ?? []),
      }).unwrap();
      notify.success(`${draft.name} saved.`, draft._id ? "Plan updated" : "Plan created");
      setModal(false);
    } catch (e) {
      notify.error(errMessage(e, "Could not save the plan."));
    }
  };

  const remove_ = (p: Plan) => {
    confirmDelete({
      title: `Delete ${p.name}?`,
      body: "Deactivate instead if it still has subscribers — deletion is refused while any subscription references it.",
      onConfirm: async () => {
        try {
          await remove(p._id).unwrap();
          notify.success(`${p.name} deleted.`);
        } catch (e) {
          notify.error(errMessage(e, "Could not delete the plan."));
        }
      },
    });
  };

  if (isLoading) return <Center py={64}><Loader size="sm" /></Center>;

  return (
    <Stack gap="md">
      <Group justify="flex-end">
        <Button size="xs" color="emerald" leftSection={<Plus size={14} />} onClick={openNew}>
          New plan
        </Button>
      </Group>

      <Card withBorder radius="md" padding={0}>
        <Table verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Monthly</Table.Th>
              <Table.Th>Yearly</Table.Th>
              <Table.Th>Sites</Table.Th>
              <Table.Th>Audits/mo</Table.Th>
              <Table.Th>Crawls/mo</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {plans.map((p) => (
              <Table.Tr key={p._id}>
                <Table.Td><Text size="sm" fw={600}>{p.name}</Text></Table.Td>
                <Table.Td>{money(p.priceMonthly)}</Table.Td>
                <Table.Td>{money(p.priceYearly)}</Table.Td>
                <Table.Td>{p.maxSites}</Table.Td>
                <Table.Td>{p.monthlyAuditQuota}</Table.Td>
                <Table.Td>{p.monthlyCrawlQuota}</Table.Td>
                <Table.Td>
                  <Badge size="sm" variant="light" color={p.active ? "emerald" : "gray"}>
                    {p.active ? "active" : "inactive"}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap={4} wrap="nowrap">
                    <ActionIcon variant="subtle" size="sm" onClick={() => openEdit(p)}>
                      <Pencil size={14} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" size="sm" color="red" onClick={() => remove_(p)}>
                      <Trash2 size={14} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
            {!plans.length && (
              <Table.Tr><Table.Td colSpan={8}><Text size="sm" c="dimmed" py="md">No plans yet.</Text></Table.Td></Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Card>

      <Modal opened={modal} onClose={() => setModal(false)} title={draft._id ? "Edit plan" : "New plan"} radius="lg" centered size="lg">
        <Stack gap="sm">
          <Group grow>
            <TextInput label="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.currentTarget.value })} />
            <TextInput label="Slug" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.currentTarget.value })} placeholder="starter" />
          </Group>
          <Textarea label="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.currentTarget.value })} autosize minRows={2} />
          <Group grow>
            <NumberInput label="Price / month (₹)" value={(draft.priceMonthly ?? 0) / 100 || undefined} onChange={(v) => setDraft({ ...draft, priceMonthly: Number(v) || 0 })} min={0} />
            <NumberInput label="Price / year (₹)" value={(draft.priceYearly ?? 0) / 100 || undefined} onChange={(v) => setDraft({ ...draft, priceYearly: Number(v) || 0 })} min={0} />
          </Group>
          <Group grow>
            <TextInput label="Razorpay plan id (monthly)" value={draft.razorpayPlanIdMonthly} onChange={(e) => setDraft({ ...draft, razorpayPlanIdMonthly: e.currentTarget.value })} placeholder="plan_xxxxx" />
            <TextInput label="Razorpay plan id (yearly)" value={draft.razorpayPlanIdYearly} onChange={(e) => setDraft({ ...draft, razorpayPlanIdYearly: e.currentTarget.value })} placeholder="plan_xxxxx" />
          </Group>
          <Group grow>
            <NumberInput label="Max sites" value={draft.maxSites} onChange={(v) => setDraft({ ...draft, maxSites: Number(v) || 1 })} min={1} />
            <NumberInput label="Audits / month" value={draft.monthlyAuditQuota} onChange={(v) => setDraft({ ...draft, monthlyAuditQuota: Number(v) || 0 })} min={0} />
            <NumberInput label="Crawls / month" value={draft.monthlyCrawlQuota} onChange={(v) => setDraft({ ...draft, monthlyCrawlQuota: Number(v) || 0 })} min={0} />
          </Group>
          <Textarea
            label="Features (one per line)"
            value={(draft.features ?? []).join("\n")}
            onChange={(e) => setDraft({ ...draft, features: e.currentTarget.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
            autosize minRows={2}
          />
          <Switch label="Active (visible on the Billing page)" checked={draft.active !== false} onChange={(e) => setDraft({ ...draft, active: e.currentTarget.checked })} />
          <Group justify="flex-end" mt="sm">
            <Button variant="subtle" onClick={() => setModal(false)}>Cancel</Button>
            <Button color="emerald" loading={saving} onClick={submit}>Save</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

/* --------------------------------- addons ------------------------------------ */

const emptyAddon: Partial<AddonPack> = {
  name: "", slug: "", type: "audit", quantity: 10, price: 0, active: true, sortOrder: 0,
};

function AddonsTab() {
  const { data: addons = [], isLoading } = useGetAdminAddonPacksQuery();
  const [save, { isLoading: saving }] = useSaveAdminAddonPackMutation();
  const [remove] = useDeleteAdminAddonPackMutation();

  const [modal, setModal] = useState(false);
  const [draft, setDraft] = useState<Partial<AddonPack>>(emptyAddon);

  const openNew = () => { setDraft(emptyAddon); setModal(true); };
  const openEdit = (a: AddonPack) => { setDraft(a); setModal(true); };

  const submit = async () => {
    try {
      await save({
        ...draft,
        price: Math.round(Number(draft.price ?? 0) * 100),
      }).unwrap();
      notify.success(`${draft.name} saved.`, draft._id ? "Addon updated" : "Addon created");
      setModal(false);
    } catch (e) {
      notify.error(errMessage(e, "Could not save the addon."));
    }
  };

  const remove_ = (a: AddonPack) => {
    confirmDelete({
      title: `Delete ${a.name}?`,
      body: "Past purchases already made are unaffected — this only removes it from the Billing page.",
      onConfirm: async () => {
        try {
          await remove(a._id).unwrap();
          notify.success(`${a.name} deleted.`);
        } catch (e) {
          notify.error(errMessage(e, "Could not delete the addon."));
        }
      },
    });
  };

  if (isLoading) return <Center py={64}><Loader size="sm" /></Center>;

  return (
    <Stack gap="md">
      <Group justify="flex-end">
        <Button size="xs" color="emerald" leftSection={<Plus size={14} />} onClick={openNew}>
          New addon pack
        </Button>
      </Group>

      <Card withBorder radius="md" padding={0}>
        <Table verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Quantity</Table.Th>
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
                  <Badge size="sm" variant="light" color="gray" leftSection={a.type === "audit" ? <Search size={11} /> : <Globe2 size={11} />}>
                    {a.type}
                  </Badge>
                </Table.Td>
                <Table.Td>{a.quantity}</Table.Td>
                <Table.Td>{money(a.price)}</Table.Td>
                <Table.Td>
                  <Badge size="sm" variant="light" color={a.active ? "emerald" : "gray"}>
                    {a.active ? "active" : "inactive"}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap={4} wrap="nowrap">
                    <ActionIcon variant="subtle" size="sm" onClick={() => openEdit(a)}>
                      <Pencil size={14} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" size="sm" color="red" onClick={() => remove_(a)}>
                      <Trash2 size={14} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
            {!addons.length && (
              <Table.Tr><Table.Td colSpan={6}><Text size="sm" c="dimmed" py="md">No addon packs yet.</Text></Table.Td></Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Card>

      <Modal opened={modal} onClose={() => setModal(false)} title={draft._id ? "Edit addon pack" : "New addon pack"} radius="lg" centered>
        <Stack gap="sm">
          <Group grow>
            <TextInput label="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.currentTarget.value })} placeholder="+10 audits" />
            <TextInput label="Slug" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.currentTarget.value })} placeholder="audits-10" />
          </Group>
          <Group grow>
            <Select
              label="Type"
              value={draft.type}
              onChange={(v) => setDraft({ ...draft, type: (v as AddonType) ?? "audit" })}
              data={[{ value: "audit", label: "SEO audits" }, { value: "crawl", label: "Site crawls" }]}
            />
            <NumberInput label="Quantity" value={draft.quantity} onChange={(v) => setDraft({ ...draft, quantity: Number(v) || 1 })} min={1} />
          </Group>
          <NumberInput label="Price (₹)" value={(draft.price ?? 0) / 100 || undefined} onChange={(v) => setDraft({ ...draft, price: Number(v) || 0 })} min={0} />
          <Switch label="Active (visible on the Billing page)" checked={draft.active !== false} onChange={(e) => setDraft({ ...draft, active: e.currentTarget.checked })} />
          <Group justify="flex-end" mt="sm">
            <Button variant="subtle" onClick={() => setModal(false)}>Cancel</Button>
            <Button color="emerald" loading={saving} onClick={submit}>Save</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
