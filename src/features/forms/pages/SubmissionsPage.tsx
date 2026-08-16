import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card, Group, Text, Stack, Button, Table, Center, ThemeIcon, Loader,
  ActionIcon, Tooltip, Pagination, Alert,
} from "@mantine/core";
import { ArrowLeft, Inbox, Trash2, Download, TriangleAlert } from "lucide-react";
import { useGetFormQuery, useGetFormSubmissionsQuery, useDeleteFormSubmissionMutation } from "@/app/store";
import { notify, notifyError, confirmDelete } from "@/shared/lib/notify";
import { getToken } from "@/shared/lib/http";

const BASE = import.meta.env.VITE_API_BASE ?? "";
const LIMIT = 25;

export default function SubmissionsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const { data: form } = useGetFormQuery({ id: id! }, { skip: !id });
  const { data, isLoading } = useGetFormSubmissionsQuery(
    { id: id!, page, limit: LIMIT },
    { skip: !id }
  );
  const [remove] = useDeleteFormSubmissionMutation();

  const fields = form?.fields ?? [];
  const overQuota = (data?.submissions ?? []).some((s) => s.overQuota);

  const del = (sid: string) =>
    confirmDelete({
      title: "Delete submission?",
      body: "This entry will be permanently removed.",
      onConfirm: async () => {
        try {
          await remove({ id: id!, sid }).unwrap();
        } catch (e) {
          notifyError(e, "Could not delete the submission.");
        }
      },
    });

  // A binary attachment behind auth can't be a plain <a href> — the request
  // needs the Bearer token, so it's fetched and saved as a blob, mirroring
  // ExportMenu's pattern for the analytics CSV/XLSX export.
  const exportCsv = async () => {
    if (!id || exporting) return;
    setExporting(true);
    try {
      const token = getToken();
      const res = await fetch(`${BASE}/api/forms/${id}/submissions.csv`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) {
        if (res.status === 402) {
          notify.error("CSV export is not available on this plan.");
        } else {
          throw new Error(`Export failed (${res.status})`);
        }
        return;
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition") ?? "";
      const named = /filename="([^"]+)"/.exec(cd)?.[1];
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = named ?? `${form?.name ?? "form"}-submissions.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      notify.error("Could not export submissions. Try again in a moment.");
    } finally {
      setExporting(false);
    }
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / LIMIT)) : 1;

  return (
    <Stack gap="lg" p="lg">
      <Group justify="space-between" wrap="wrap">
        <Group gap="sm">
          <ActionIcon variant="subtle" color="gray" onClick={() => navigate(`/app/forms/${id}/edit`)}>
            <ArrowLeft size={16} />
          </ActionIcon>
          <Text fw={700} size="lg">{form?.name ?? "Submissions"}</Text>
        </Group>
        <Button
          variant="default"
          leftSection={<Download size={15} />}
          onClick={exportCsv}
          loading={exporting}
        >
          Export CSV
        </Button>
      </Group>

      {overQuota && (
        <Alert color="orange" variant="light" icon={<TriangleAlert size={16} />} title="Over the submission quota">
          Leads are still being captured, but email notifications are paused until the workspace is under
          quota again or the plan is upgraded.
        </Alert>
      )}

      <Card withBorder radius="lg" padding={0}>
        {isLoading ? (
          <Center py="xl"><Loader size="sm" /></Center>
        ) : !data || data.submissions.length === 0 ? (
          <Center py="xl" mih={140}>
            <Stack align="center" gap={4}>
              <ThemeIcon variant="light" color="gray" size="md" radius="md"><Inbox size={16} /></ThemeIcon>
              <Text c="dimmed" size="xs">No submissions yet.</Text>
            </Stack>
          </Center>
        ) : (
          <Table.ScrollContainer minWidth={600}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  {fields.map((f) => <Table.Th key={f.key}>{f.label}</Table.Th>)}
                  <Table.Th>Submitted</Table.Th>
                  <Table.Th w={40} />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.submissions.map((s) => (
                  <Table.Tr key={s.id}>
                    {fields.map((f) => (
                      <Table.Td key={f.key}>
                        <Text size="sm" lineClamp={2}>{s.data[f.key] ?? ""}</Text>
                      </Table.Td>
                    ))}
                    <Table.Td><Text size="sm" c="dimmed">{new Date(s.createdAt).toLocaleString()}</Text></Table.Td>
                    <Table.Td>
                      <Tooltip label="Delete" withArrow>
                        <ActionIcon variant="subtle" color="red" size="sm" onClick={() => del(s.id)}>
                          <Trash2 size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>

      {totalPages > 1 && (
        <Group justify="center">
          <Pagination value={page} onChange={setPage} total={totalPages} />
        </Group>
      )}
    </Stack>
  );
}
