import { useState } from "react";
import {
  Text, Group, Button, Card, Table, Badge, Modal, TextInput, NumberInput,
  Stack, Switch, Tabs, ActionIcon, Center, Loader, Select,
} from "@mantine/core";
import { Plus, Pencil, Trash2, Search, Globe2, Tag, Eye } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { PageHeader } from "../components/Page";
import {
  useGetAdminPlansQuery, useSaveAdminPlanPriceMutation,
  useGetAdminAddonPacksQuery, useSaveAdminAddonPackMutation, useDeleteAdminAddonPackMutation,
  useGetAdminCouponsQuery, useSaveAdminCouponMutation, useDeleteAdminCouponMutation,
  useCheckCouponMutation,
} from "../store";
import { notify, errMessage, confirmDelete } from "../notify";
import { CURRENCIES, CURRENCY_SYMBOLS } from "../types";
import type { Plan, AddonPack, AddonType, Coupon, Currency, CurrencyPrices } from "../types";
import { formatMoney, priceIn } from "../utils/currency";

function money(amountMinor: number, currency: Currency = "INR"): string {
  return formatMoney(amountMinor, currency);
}

const emptyPrices = (): CurrencyPrices =>
  Object.fromEntries(CURRENCIES.map((c) => [c, 0])) as CurrencyPrices;

const toRupees = (prices: CurrencyPrices): CurrencyPrices =>
  Object.fromEntries(CURRENCIES.map((c) => [c, (prices[c] ?? 0) / 100])) as CurrencyPrices;

const toMinor = (rupees: CurrencyPrices): CurrencyPrices =>
  Object.fromEntries(CURRENCIES.map((c) => [c, Math.round((rupees[c] ?? 0) * 100)])) as CurrencyPrices;

/** One numeric input per currency, sharing a label prefix (e.g. "Price / month"). */
function CurrencyPriceInputs({
  label,
  values,
  onChange,
}: {
  label: string;
  values: CurrencyPrices;
  onChange: (values: CurrencyPrices) => void;
}) {
  return (
    <Stack gap={4}>
      <Text size="sm" fw={500}>{label}</Text>
      <Group grow>
        {CURRENCIES.map((c) => (
          <NumberInput
            key={c}
            label={c}
            leftSection={<Text size="sm" c="dimmed">{CURRENCY_SYMBOLS[c]}</Text>}
            value={values[c] || undefined}
            onChange={(v) => onChange({ ...values, [c]: Number(v) || 0 })}
            min={0}
          />
        ))}
      </Group>
    </Stack>
  );
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
          <Tabs.Tab value="coupons">Coupons</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="plans"><PlansTab /></Tabs.Panel>
        <Tabs.Panel value="addons"><AddonsTab /></Tabs.Panel>
        <Tabs.Panel value="coupons"><CouponsTab /></Tabs.Panel>
      </Tabs>
    </AppShell>
  );
}

/* ---------------------------------- plans ----------------------------------- */

/**
 * Plans themselves — name, quotas, workspace/site limits, Razorpay ids — are
 * fixed in backend code (`src/plans.ts`), not admin-editable. The only thing
 * this tab does is set price, so there's no "new plan" button and no delete:
 * adding or retiring a tier is a code change and a deploy, not a form submit.
 */
function PlansTab() {
  const { data: plans = [], isLoading } = useGetAdminPlansQuery();
  const [save, { isLoading: saving }] = useSaveAdminPlanPriceMutation();

  const [modal, setModal] = useState(false);
  const [draft, setDraft] = useState<Plan | null>(null);
  // Same rupee/paise split as the addon form — editing `draft.priceMonthly`
  // directly and re-deriving the display value as `/100` on every render
  // double-divides an already-rupee value on the second keystroke.
  const [priceMonthlyRupees, setPriceMonthlyRupees] = useState<CurrencyPrices>(emptyPrices);
  const [priceYearlyRupees, setPriceYearlyRupees] = useState<CurrencyPrices>(emptyPrices);

  const openEdit = (p: Plan) => {
    setDraft(p);
    setPriceMonthlyRupees(toRupees(p.priceMonthly));
    setPriceYearlyRupees(toRupees(p.priceYearly));
    setModal(true);
  };

  const submit = async () => {
    if (!draft) return;
    try {
      await save({
        slug: draft.slug,
        priceMonthly: toMinor(priceMonthlyRupees),
        priceYearly: toMinor(priceYearlyRupees),
      }).unwrap();
      notify.success(`${draft.name} price updated.`, "Plan updated");
      setModal(false);
    } catch (e) {
      notify.error(errMessage(e, "Could not save the price."));
    }
  };

  if (isLoading) return <Center py={64}><Loader size="sm" /></Center>;

  return (
    <Stack gap="md">
      <Card withBorder radius="md" padding={0}>
        <Table verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Monthly</Table.Th>
              <Table.Th>Yearly</Table.Th>
              <Table.Th>Workspaces</Table.Th>
              <Table.Th>Sites/ws</Table.Th>
              <Table.Th>Audits/mo</Table.Th>
              <Table.Th>Crawls/mo</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {plans.map((p) => (
              <Table.Tr key={p.slug}>
                <Table.Td><Text size="sm" fw={600}>{p.name}</Text></Table.Td>
                <Table.Td>{CURRENCIES.map((c) => money(p.priceMonthly[c], c)).join(" / ")}</Table.Td>
                <Table.Td>{CURRENCIES.map((c) => money(p.priceYearly[c], c)).join(" / ")}</Table.Td>
                <Table.Td>{p.maxWorkspaces}</Table.Td>
                <Table.Td>{p.maxSitesPerWorkspace}</Table.Td>
                <Table.Td>{p.monthlyAuditQuota}</Table.Td>
                <Table.Td>{p.monthlyCrawlQuota}</Table.Td>
                <Table.Td>
                  <ActionIcon variant="subtle" size="sm" onClick={() => openEdit(p)}>
                    <Pencil size={14} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
            {!plans.length && (
              <Table.Tr><Table.Td colSpan={8}><Text size="sm" c="dimmed" py="md">No plans yet.</Text></Table.Td></Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Card>

      <Modal opened={modal} onClose={() => setModal(false)} title={draft ? `Edit ${draft.name} price` : ""} radius="lg" centered>
        {draft && (
          <Stack gap="sm">
            <Text size="sm" c="dimmed">
              Only price can be changed here. Quotas, workspace and site limits, and Razorpay ids
              are fixed in code.
            </Text>
            <CurrencyPriceInputs label="Price / month" values={priceMonthlyRupees} onChange={setPriceMonthlyRupees} />
            <CurrencyPriceInputs label="Price / year" values={priceYearlyRupees} onChange={setPriceYearlyRupees} />
            <Group justify="flex-end" mt="sm">
              <Button variant="subtle" onClick={() => setModal(false)}>Cancel</Button>
              <Button color="emerald" loading={saving} onClick={submit}>Save</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}

/* --------------------------------- addons ------------------------------------ */

const emptyAddon: Partial<AddonPack> = {
  name: "", slug: "", type: "audit", quantity: 10, price: emptyPrices(), active: true, sortOrder: 0,
};

function AddonsTab() {
  const { data: addons = [], isLoading } = useGetAdminAddonPacksQuery();
  const [save, { isLoading: saving }] = useSaveAdminAddonPackMutation();
  const [remove] = useDeleteAdminAddonPackMutation();

  const [modal, setModal] = useState(false);
  const [draft, setDraft] = useState<Partial<AddonPack>>(emptyAddon);
  // Price is edited in rupees but stored (and returned by the API) in paise.
  // Keeping a separate rupee field for the input avoids re-deriving it from
  // `draft.price / 100` on every keystroke — dividing an already-rupee value
  // by 100 again on the next render is what turned "500" into "0.000002".
  const [priceRupees, setPriceRupees] = useState<CurrencyPrices>(emptyPrices);

  const openNew = () => { setDraft(emptyAddon); setPriceRupees(emptyPrices()); setModal(true); };
  const openEdit = (a: AddonPack) => { setDraft(a); setPriceRupees(toRupees(a.price)); setModal(true); };

  const submit = async () => {
    try {
      await save({
        ...draft,
        price: toMinor(priceRupees),
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
                <Table.Td>{CURRENCIES.map((c) => money(a.price[c], c)).join(" / ")}</Table.Td>
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
          <CurrencyPriceInputs label="Price" values={priceRupees} onChange={setPriceRupees} />
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

/* --------------------------------- coupons ------------------------------------ */

const emptyCoupon: Partial<Coupon> = { code: "", percentOff: 10, active: true, expiresAt: null };

function CouponsTab() {
  const { data: coupons = [], isLoading } = useGetAdminCouponsQuery();
  const { data: plans = [] } = useGetAdminPlansQuery();
  const [save, { isLoading: saving }] = useSaveAdminCouponMutation();
  const [remove] = useDeleteAdminCouponMutation();

  const [modal, setModal] = useState(false);
  const [draft, setDraft] = useState<Partial<Coupon>>(emptyCoupon);
  const [preview, setPreview] = useState<Coupon | null>(null);

  const openNew = () => { setDraft(emptyCoupon); setModal(true); };
  const openEdit = (c: Coupon) => { setDraft(c); setModal(true); };

  const submit = async () => {
    try {
      await save(draft).unwrap();
      notify.success(`${draft.code} saved.`, draft._id ? "Coupon updated" : "Coupon created");
      setModal(false);
    } catch (e) {
      notify.error(errMessage(e, "Could not save the coupon."));
    }
  };

  const remove_ = (c: Coupon) => {
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
  };

  if (isLoading) return <Center py={64}><Loader size="sm" /></Center>;

  const expired = (c: Coupon) => c.expiresAt && new Date(c.expiresAt).getTime() < Date.now();

  return (
    <Stack gap="md">
      <Group justify="flex-end">
        <Button size="xs" color="emerald" leftSection={<Plus size={14} />} onClick={openNew}>
          New coupon
        </Button>
      </Group>

      <Card withBorder radius="md" padding={0}>
        <Table verticalSpacing="sm" horizontalSpacing="md">
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
            {coupons.map((c) => (
              <Table.Tr key={c._id}>
                <Table.Td>
                  <Badge size="sm" variant="light" color="gray" leftSection={<Tag size={11} />}>{c.code}</Badge>
                </Table.Td>
                <Table.Td>{c.percentOff}% off</Table.Td>
                <Table.Td>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "never"}</Table.Td>
                <Table.Td>
                  <Badge size="sm" variant="light" color={!c.active ? "gray" : expired(c) ? "red" : "emerald"}>
                    {!c.active ? "inactive" : expired(c) ? "expired" : "active"}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap={4} wrap="nowrap">
                    <ActionIcon variant="subtle" size="sm" onClick={() => setPreview(c)}>
                      <Eye size={14} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" size="sm" onClick={() => openEdit(c)}>
                      <Pencil size={14} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" size="sm" color="red" onClick={() => remove_(c)}>
                      <Trash2 size={14} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
            {!coupons.length && (
              <Table.Tr><Table.Td colSpan={5}><Text size="sm" c="dimmed" py="md">No coupons yet.</Text></Table.Td></Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Card>

      <CouponPreview coupon={preview} plans={plans} onClose={() => setPreview(null)} />

      <Modal opened={modal} onClose={() => setModal(false)} title={draft._id ? "Edit coupon" : "New coupon"} radius="lg" centered>
        <Stack gap="sm">
          <TextInput
            label="Code"
            value={draft.code}
            onChange={(e) => setDraft({ ...draft, code: e.currentTarget.value.toUpperCase() })}
            placeholder="SAVE20"
          />
          <NumberInput
            label="Percent off"
            value={draft.percentOff}
            onChange={(v) => setDraft({ ...draft, percentOff: Number(v) || 1 })}
            min={1}
            max={100}
            suffix="%"
          />
          <TextInput
            label="Expires (optional)"
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
            <Button variant="subtle" onClick={() => setModal(false)}>Cancel</Button>
            <Button color="emerald" loading={saving} onClick={submit}>Save</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

/**
 * Preview a coupon against a real plan price, per currency and cycle — the
 * same `/coupons/check` endpoint checkout uses, so what an admin sees here is
 * exactly what a customer would get.
 */
function CouponPreview({
  coupon,
  plans,
  onClose,
}: {
  coupon: Coupon | null;
  plans: Plan[];
  onClose: () => void;
}) {
  const [planSlug, setPlanSlug] = useState<string | null>(null);
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [currency, setCurrency] = useState<Currency>("INR");
  const [checkCoupon, { isLoading }] = useCheckCouponMutation();
  const [result, setResult] = useState<{ amount: number; error?: string } | null>(null);

  const plan = plans.find((p) => p.slug === planSlug) ?? plans[0] ?? null;
  const listPrice = plan ? priceIn(cycle === "yearly" ? plan.priceYearly : plan.priceMonthly, currency) : 0;

  const run = async () => {
    if (!coupon || !plan) return;
    setResult(null);
    try {
      const res = await checkCoupon({ amount: listPrice, code: coupon.code }).unwrap();
      setResult(res);
    } catch (e) {
      setResult({ amount: listPrice, error: errMessage(e, "invalid coupon") });
    }
  };

  return (
    <Modal opened={!!coupon} onClose={onClose} title={coupon ? `Preview ${coupon.code}` : ""} radius="lg" centered>
      {coupon && (
        <Stack gap="sm">
          <Select
            label="Plan"
            value={plan?.slug ?? null}
            onChange={(v) => { setPlanSlug(v); setResult(null); }}
            data={plans.map((p) => ({ value: p.slug, label: p.name }))}
          />
          <Group grow>
            <Select
              label="Cycle"
              value={cycle}
              onChange={(v) => { setCycle((v as "monthly" | "yearly") ?? "monthly"); setResult(null); }}
              data={[{ value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" }]}
            />
            <Select
              label="Currency"
              value={currency}
              onChange={(v) => { setCurrency((v as Currency) ?? "INR"); setResult(null); }}
              data={CURRENCIES.map((c) => ({ value: c, label: c }))}
            />
          </Group>

          <Group justify="space-between" mt="xs">
            <Text size="sm" c="dimmed">List price</Text>
            <Text size="sm">{money(listPrice, currency)}</Text>
          </Group>

          <Button size="sm" color="emerald" loading={isLoading} onClick={run} disabled={!plan}>
            Check
          </Button>

          {result && (
            result.error ? (
              <Text size="sm" c="red">{result.error}</Text>
            ) : (
              <Group justify="space-between">
                <Text size="sm" c="dimmed">After {coupon.percentOff}% off</Text>
                <Text size="sm" fw={700}>{money(result.amount, currency)}</Text>
              </Group>
            )
          )}
        </Stack>
      )}
    </Modal>
  );
}
