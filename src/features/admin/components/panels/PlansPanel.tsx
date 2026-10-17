import { useState } from "react";
import { ActionIcon, Button, Card, Center, Group, Loader, Modal, Stack, Table, Text } from "@mantine/core";
import { Pencil } from "lucide-react";
import { useGetAdminPlansQuery, useSaveAdminPlanPriceMutation } from "@/app/store";
import { notify, errMessage } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";
import { useAuth } from "@/features/auth/context";
import type { CurrencyPrices, Plan } from "@/shared/types";
import { AdminSection } from "../layout/AdminSection";
import { AdminRefreshButton } from "../layout/AdminRefreshButton";
import { CurrencyPriceInputs } from "../billing/CurrencyPriceInputs";
import { CurrencySync } from "../billing/CurrencySync";
import { emptyPrices, moneyList, toMajor, toMinor } from "../billing/billingFormat";

export default function PlansPanel() {
  const { user } = useAuth();
  const { data: plans = [], isLoading, isFetching, refetch } = useGetAdminPlansQuery();
  const [save, { isLoading: saving }] = useSaveAdminPlanPriceMutation();

  const [draft, setDraft] = useState<Plan | null>(null);
  const [monthly, setMonthly] = useState<CurrencyPrices>(emptyPrices);
  const [yearly, setYearly] = useState<CurrencyPrices>(emptyPrices);

  const openEdit = (p: Plan) => {
    setDraft(p);
    setMonthly(toMajor(p.priceMonthly));
    setYearly(toMajor(p.priceYearly));
  };

  const submit = async () => {
    if (!draft) return;
    trace(user?.id, "save_plan_price", "admin_billing", draft.slug);
    try {
      await save({ slug: draft.slug, priceMonthly: toMinor(monthly), priceYearly: toMinor(yearly) }).unwrap();
      notify.success(`${draft.name} price updated.`, "Plan updated");
      setDraft(null);
    } catch (e) {
      notify.error(errMessage(e, "Could not save the price."));
    }
  };

  return (
    <AdminSection
      id="plans"
      actions={
        <>
          <CurrencySync />
          <AdminRefreshButton onClick={refetch} loading={isFetching} />
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
                  <Table.Th>Plan</Table.Th>
                  <Table.Th>Monthly</Table.Th>
                  <Table.Th>Yearly</Table.Th>
                  <Table.Th>Audits / mo</Table.Th>
                  <Table.Th>Crawls / mo</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {plans.map((p) => (
                  <Table.Tr key={p.slug}>
                    <Table.Td><Text size="sm" fw={600}>{p.name}</Text></Table.Td>
                    <Table.Td><Text size="sm">{moneyList(p.priceMonthly)}</Text></Table.Td>
                    <Table.Td><Text size="sm">{moneyList(p.priceYearly)}</Text></Table.Td>
                    <Table.Td><Text size="sm">{p.monthlyAuditQuota}</Text></Table.Td>
                    <Table.Td><Text size="sm">{p.monthlyCrawlQuota}</Text></Table.Td>
                    <Table.Td>
                      <Group justify="flex-end">
                        <ActionIcon variant="subtle" color="gray" onClick={() => openEdit(p)} aria-label={`Edit ${p.name} price`}>
                          <Pencil size={15} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
                {!plans.length && (
                  <Table.Tr>
                    <Table.Td colSpan={6}><Text size="sm" c="dimmed" py="md">No plans yet.</Text></Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Card>
      )}

      <Modal opened={Boolean(draft)} onClose={() => setDraft(null)} title={draft ? `${draft.name} price` : ""} radius="lg" centered>
        {draft && (
          <Stack gap="sm">
            <Text size="sm" c="dimmed">
              Only the price changes here. A USD price typed here holds until the next Sync USD prices, which
              recomputes it from the INR price.
            </Text>
            <CurrencyPriceInputs label="Price per month" values={monthly} onChange={setMonthly} />
            <CurrencyPriceInputs label="Price per year" values={yearly} onChange={setYearly} />
            <Group justify="flex-end" mt="sm">
              <Button variant="default" onClick={() => setDraft(null)}>Cancel</Button>
              <Button color="emerald" loading={saving} onClick={submit}>Save price</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </AdminSection>
  );
}
