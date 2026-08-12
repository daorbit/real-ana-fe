import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import {
  Box, Group, Button, Text, Loader, Center, Table, Badge, Pagination, Stack,
  ActionIcon, Tooltip, ThemeIcon, Alert, ScrollArea,
} from "@mantine/core";
import { ArrowLeft, Download, Trash2, Inbox, AlertTriangle, PenLine } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { PageHeader, PageStack } from "@/shared/ui/Page";
import { useGetFormQuery, useGetSubmissionsQuery, useDeleteSubmissionMutation } from "@/app/store";
import { useActiveBilling, usePermissions } from "@/features/workspace/context";
import { notify, errMessage, confirmDelete } from "@/shared/lib/notify";
import { downloadSubmissionsCsv } from "@/features/forms/lib/download";
import type { Submission, FormField } from "@/features/forms/lib/types";

const PAGE_SIZE = 50;

/**
 * What a form has collected.
 *
 * A table rather than cards: submissions are the same handful of fields over
 * and over, which is exactly what a table is for — and it is the shape people
 * will export to a spreadsheet anyway.
 *
 * Values are rendered as text, never as HTML. That single rule is the whole XSS
 * story for forms: this data comes from an unauthenticated endpoint and is
 * therefore attacker-controlled, and React escaping it by default is what makes
 * the table safe.
 */
export default function SubmissionsPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const billing = useActiveBilling();
  const { canEdit } = usePermissions();
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const { data: form } = useGetFormQuery(id, { skip: !id });
  const { data, isLoading } = useGetSubmissionsQuery({ id, page, limit: PAGE_SIZE }, { skip: !id });
  const [remove] = useDeleteSubmissionMutation();

  const submissions = data?.submissions ?? [];
  // Retired fields are included: their answers are still stored, and a column
  // that vanishes takes the meaning of the data under it with it.
  const fields = (data?.fields ?? []).slice().sort((a, b) => a.order - b.order);
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const canExport = billing?.forms?.csvExport ?? false;

  const exportCsv = async () => {
    setExporting(true);
    try {
      await downloadSubmissionsCsv(id, form?.name ?? "submissions");
    } catch (e) {
      // The server's own message carries the upgrade reason on a 402.
      notify.error(errMessage(e, "Could not export these responses"));
    } finally {
      setExporting(false);
    }
  };

  const destroy = (submission: Submission) =>
    confirmDelete({
      title: "Delete this response?",
      body: "It will be removed permanently. This cannot be undone.",
      onConfirm: async () => {
        try {
          await remove({ id, submissionId: submission.id }).unwrap();
          notify.success("Response deleted");
        } catch (e) {
          notify.error(errMessage(e, "Could not delete this response"));
        }
      },
    });

  return (
    <AppShell>
      <PageStack maxWidth="100%">
        <PageHeader
          title={form?.name ? `${form.name} — responses` : "Responses"}
          description={
            total
              ? `${total} response${total === 1 ? "" : "s"} collected.`
              : "Nothing has come in yet."
          }
          actions={
            <Group gap="xs">
              <Button
                variant="subtle"
                leftSection={<ArrowLeft size={15} />}
                onClick={() => navigate("/app/forms")}
              >
                Forms
              </Button>
              {canEdit && (
                <Button
                  variant="default"
                  leftSection={<PenLine size={15} />}
                  onClick={() => navigate(`/app/forms/${id}`)}
                >
                  Edit form
                </Button>
              )}
              <Tooltip
                label="CSV export is on the paid plans"
                disabled={canExport}
                withArrow
              >
                <Button
                  leftSection={<Download size={15} />}
                  onClick={exportCsv}
                  loading={exporting}
                  disabled={!canExport || !total}
                >
                  Export CSV
                </Button>
              </Tooltip>
            </Group>
          }
        />

        {isLoading ? (
          <Center py={64}><Loader size="sm" /></Center>
        ) : !total ? (
          <Box className="surface-card" py={64} px="xl">
            <Stack align="center" gap={6}>
              <ThemeIcon size={56} radius="xl" variant="light" color="emerald" mb="xs">
                <Inbox size={26} />
              </ThemeIcon>
              <Text fw={650} size="lg">No responses yet</Text>
              <Text size="sm" c="dimmed" ta="center" maw={440} lh={1.6}>
                {form?.status === "draft"
                  ? "This form is still a draft. Publish it and share the link to start collecting."
                  : "Share the form's link and responses will appear here as they arrive."}
              </Text>
            </Stack>
          </Box>
        ) : (
          <Stack gap="md">
            {submissions.some((s) => s.flagged) && (
              <Alert color="orange" icon={<AlertTriangle size={16} />} radius="md">
                <Text size="sm">
                  Some responses are marked for review — they arrived while this form was
                  receiving an unusual burst of traffic. They are kept, but were not emailed to
                  you.
                </Text>
              </Alert>
            )}

            <Box className="surface-card" p={0}>
              <ScrollArea>
                <Table striped highlightOnHover verticalSpacing="sm" miw={640}>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ whiteSpace: "nowrap" }}>Received</Table.Th>
                      {fields.map((field) => (
                        <Table.Th key={field.key} style={{ whiteSpace: "nowrap" }}>
                          <Group gap={4} wrap="nowrap">
                            {field.label}
                            {field.hidden && (
                              <Tooltip
                                label="This field was removed from the form. Earlier responses keep it."
                                withArrow
                              >
                                <Badge size="xs" variant="light" color="gray">retired</Badge>
                              </Tooltip>
                            )}
                          </Group>
                        </Table.Th>
                      ))}
                      <Table.Th style={{ whiteSpace: "nowrap" }}>Source</Table.Th>
                      {canEdit && <Table.Th />}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {submissions.map((submission) => (
                      <Table.Tr key={submission.id}>
                        <Table.Td style={{ whiteSpace: "nowrap" }}>
                          <Group gap={6} wrap="nowrap">
                            <Text size="sm">
                              {new Date(submission.createdAt).toLocaleString()}
                            </Text>
                            {submission.flagged && (
                              <Tooltip label={submission.flagReason} withArrow>
                                <Badge size="xs" variant="light" color="orange">review</Badge>
                              </Tooltip>
                            )}
                          </Group>
                        </Table.Td>
                        {fields.map((field) => (
                          <Table.Td key={field.key}>
                            <CellValue field={field} value={submission.data[field.key]} />
                          </Table.Td>
                        ))}
                        <Table.Td>
                          <Text size="xs" c="dimmed">
                            {submission.utm.source
                              ? `${submission.utm.source}${submission.utm.medium ? ` / ${submission.utm.medium}` : ""}`
                              : hostOf(submission.referrer) || "direct"}
                          </Text>
                        </Table.Td>
                        {canEdit && (
                          <Table.Td>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => destroy(submission)}
                            >
                              <Trash2 size={15} />
                            </ActionIcon>
                          </Table.Td>
                        )}
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Box>

            {pages > 1 && (
              <Group justify="center">
                <Pagination value={page} onChange={setPage} total={pages} size="sm" />
              </Group>
            )}
          </Stack>
        )}
      </PageStack>
    </AppShell>
  );
}

/** One answer, always as text. A checkbox reads as yes/no rather than true/false. */
function CellValue({ field, value }: { field: FormField; value: unknown }) {
  if (field.type === "checkbox") {
    return <Text size="sm">{value ? "Yes" : "No"}</Text>;
  }
  const text = Array.isArray(value) ? value.join(", ") : String(value ?? "");
  if (!text) return <Text size="sm" c="dimmed">—</Text>;
  return <Text size="sm">{text}</Text>;
}

/** The referring host alone — a full URL makes the column unreadable. */
function hostOf(referrer: string): string {
  if (!referrer) return "";
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return referrer.slice(0, 40);
  }
}
