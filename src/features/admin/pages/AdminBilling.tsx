import { useState, type ReactNode } from "react";
import {
  Text, Group, Button, Card, Table, Badge, Modal, TextInput, NumberInput,
  Stack, Switch, Tabs, ActionIcon, Center, Loader, Select, Tooltip,
} from "@mantine/core";
import { Plus, Pencil, Trash2, Search, Globe2, Tag, Eye, RefreshCw, CalendarClock, ClipboardList } from "lucide-react";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import {
  useGetAdminPlansQuery, useSaveAdminPlanPriceMutation,
  useGetAdminFxQuery, useSyncAdminPlanCurrencyMutation,
  useGetAdminAddonPacksQuery, useSaveAdminAddonPackMutation, useDeleteAdminAddonPackMutation,
  useGetAdminCouponsQuery, useSaveAdminCouponMutation, useDeleteAdminCouponMutation,
  useCheckCouponMutation,
} from "@/app/store";
import { notify, errMessage, confirmDelete } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";
import { useAuth } from "@/features/auth/context";
import { CURRENCIES, CURRENCY_SYMBOLS } from "@/shared/types";
import type { Plan, AddonPack, AddonType, Coupon, Currency, CurrencyPrices } from "@/shared/types";
import { formatMoney, priceIn } from "@/shared/lib/currency";

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

function RefetchButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <Tooltip label="Refetch">
      <ActionIcon variant="light" color="gray" size="lg" radius="md" loading={loading} onClick={onClick}>
        <RefreshCw size={15} />
      </ActionIcon>
    </Tooltip>
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


/** "3 hours ago" for a rate's age — precision past the hour tells an admin nothing. */
function relativeTime(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (!Number.isFinite(minutes)) return "unknown";
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

/**
 * Recompute the non-INR prices from INR at the current exchange rate.
 *
 * On purpose a button rather than a background job: the admin sees the rate and
 * its age, decides the move is worth repricing for, and presses. Prices that
 * drift on a schedule change what a customer is quoted without anyone choosing
 * it — the drift is silent, and the first person to notice is the customer.
 */
function CurrencySync() {
  const { user } = useAuth();
  const { data: fx } = useGetAdminFxQuery();
  const [sync, { isLoading: syncing }] = useSyncAdminPlanCurrencyMutation();

  const run = async () => {
    trace(user?.id, "sync_usd_prices", "admin_billing", "admin_billing");
    try {
      const result = await sync().unwrap();
      const rate = result.snapshot.rates.USD;
      notify.success(
        rate ? `Repriced at 1 ${result.base} = ${rate.toFixed(4)} USD.` : "Prices repriced.",
        "USD prices updated"
      );
    } catch (e) {
      notify.error(errMessage(e, "Could not fetch the exchange rate. Prices are unchanged."));
    }
  };

  const rate = fx?.snapshot?.rates.USD;

  return (
    <Group gap="sm">
      <Text size="xs" c="dimmed">
        {fx && !fx.configured
          ? "Exchange rate API key not configured"
          : rate && fx?.snapshot
            ? `1 ${fx.base} = $${rate.toFixed(4)} · ${relativeTime(fx.snapshot.fetchedAt)}`
            : "USD prices never synced"}
      </Text>
      <Tooltip label="Recompute USD prices from the INR price at today's rate">
        <Button
          size="xs"
          variant="light"
          radius="md"
          loading={syncing}
          disabled={fx ? !fx.configured : false}
          leftSection={<RefreshCw size={14} />}
          onClick={run}
        >
          Sync USD prices
        </Button>
      </Tooltip>
    </Group>
  );
}

/**
 * Plans themselves — name, quotas, workspace/site limits, Razorpay ids — are
 * fixed in backend code (`src/plans.ts`), not admin-editable. The only thing
 * this tab does is set price, so there's no "new plan" button and no delete:
 * adding or retiring a tier is a code change and a deploy, not a form submit.
 */
function PlansTab() {
  const { user } = useAuth();
  const { data: plans = [], isLoading, isFetching, refetch } = useGetAdminPlansQuery();
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
    trace(user?.id, "save_plan_price", "admin_billing", draft.slug);
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
      <Group justify="space-between">
        <CurrencySync />
        <RefetchButton onClick={refetch} loading={isFetching} />
      </Group>
      <Card withBorder radius="md" padding={0}>
        <Table verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Monthly</Table.Th>
              <Table.Th>Yearly</Table.Th>
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
              <Table.Tr><Table.Td colSpan={6}><Text size="sm" c="dimmed" py="md">No plans yet.</Text></Table.Td></Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Card>

      <Modal opened={modal} onClose={() => setModal(false)} title={draft ? `Edit ${draft.name} price` : ""} radius="lg" centered>
        {draft && (
          <Stack gap="sm">
            <Text size="sm" c="dimmed">
              Only price can be changed here. Quotas, workspace and site limits, and Razorpay ids
              are fixed in code. A USD price typed here holds until the next "Sync USD prices",
              which recomputes it from the INR price.
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


/**
 * A lookup rather than a ternary: an `audit ? … : …` would silently give every
 * other pack type the crawl icon.
 *
 * Exhaustive over `AddonType` on purpose — a new pack type should fail to
 * compile here rather than ship without a mark of its own.
 */
const ADDON_TYPE_ICON: Record<AddonType, ReactNode> = {
  audit: <Search size={11} />,
  crawl: <Globe2 size={11} />,
  orbit: <OrbitMark size={11} />,
  "post-slots": <CalendarClock size={11} />,
  "form-submissions": <ClipboardList size={11} />,
};

const emptyAddon: Partial<AddonPack> = {
  name: "", slug: "", type: "audit", quantity: 10, price: emptyPrices(), active: true, sortOrder: 0,
};

function AddonsTab() {
  const { user } = useAuth();
  const { data: addons = [], isLoading, isFetching, refetch } = useGetAdminAddonPacksQuery();
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
    trace(user?.id, draft._id ? "update_addon_pack" : "create_addon_pack", "admin_billing", "admin_billing");
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
        trace(user?.id, "delete_addon_pack", "admin_billing", "admin_billing");
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
        <RefetchButton onClick={refetch} loading={isFetching} />
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
                  <Badge size="sm" variant="light" color="gray" leftSection={ADDON_TYPE_ICON[a.type]}>
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
              data={[
                { value: "audit", label: "SEO audits" },
                { value: "crawl", label: "Site crawls" },
                { value: "orbit", label: "Orbit AI questions" },
                { value: "post-slots", label: "Scheduled post slots" },
                { value: "form-submissions", label: "Form responses" },
              ]}
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


const emptyCoupon: Partial<Coupon> = { code: "", percentOff: 10, active: true, expiresAt: null };

function CouponsTab() {
  const { user } = useAuth();
  const { data: coupons = [], isLoading, isFetching, refetch } = useGetAdminCouponsQuery();
  const { data: plans = [] } = useGetAdminPlansQuery();
  const [save, { isLoading: saving }] = useSaveAdminCouponMutation();
  const [remove] = useDeleteAdminCouponMutation();

  const [modal, setModal] = useState(false);
  const [draft, setDraft] = useState<Partial<Coupon>>(emptyCoupon);
  const [preview, setPreview] = useState<Coupon | null>(null);

  const openNew = () => { setDraft(emptyCoupon); setModal(true); };
  const openEdit = (c: Coupon) => { setDraft(c); setModal(true); };

  const submit = async () => {
    trace(user?.id, draft._id ? "update_coupon" : "create_coupon", "admin_billing", "admin_billing");
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
        trace(user?.id, "delete_coupon", "admin_billing", "admin_billing");
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
        <RefetchButton onClick={refetch} loading={isFetching} />
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
