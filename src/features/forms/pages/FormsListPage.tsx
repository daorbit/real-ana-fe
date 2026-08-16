import { useState } from "react";
import {
  Card, Group, Text, Stack, Button, Badge, Table, Center, ThemeIcon, Tooltip,
  Loader, ActionIcon, TextInput,
} from "@mantine/core";
import { FileText, Plus, Inbox, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useGetFormsQuery, useCreateFormMutation, useDeleteFormMutation,
} from "@/app/store";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { notify, notifyError, errCode } from "@/shared/lib/notify";
import { confirmDelete } from "@/shared/lib/notify";
import type { FormStatus } from "@/shared/types";

const STATUS_COLOR: Record<FormStatus, string> = {
  draft: "gray",
  published: "emerald",
  closed: "red",
};

export default function FormsListPage() {
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const { data: forms, isLoading } = useGetFormsQuery(
    active ? { wid: active._id } : ({} as never),
    { skip: !active }
  );

  const [create, { isLoading: creating }] = useCreateFormMutation();
  const [remove] = useDeleteFormMutation();

  const [capReason, setCapReason] = useState<string | null>(null);

  const addForm = async () => {
    if (!active) return;
    const n = name.trim() || "Untitled form";
    try {
      const form = await create({ wid: active._id, name: n }).unwrap();
      setName("");
      notify.success("Form created.", "Forms");
      navigate(`/app/forms/${form.id}/edit`);
    } catch (e) {
      if (errCode(e) === "quota_exceeded") {
        setCapReason("This workspace has reached its form limit for the current plan.");
        return;
      }
      notifyError(e, "Could not create the form.");
    }
  };

  const del = (id: string, label: string) =>
    confirmDelete({
      title: "Delete form?",
      body: <>&quot;<b>{label}</b>&quot; and its submissions will be permanently removed.</>,
      onConfirm: async () => {
        try {
          await remove({ id }).unwrap();
        } catch (e) {
          notifyError(e, "Could not delete the form.");
        }
      },
    });

  return (
    <Stack gap="lg" p="lg">
      <Group justify="space-between">
        <Group gap={8}>
          <FileText size={18} className="sect-ic" />
          <Text fw={700} size="lg">Lead forms</Text>
        </Group>
      </Group>

      {canEdit && (
        <Card withBorder radius="lg" padding="lg">
          <Group gap="sm" align="flex-end" wrap="nowrap">
            <TextInput
              label="New form name"
              placeholder="Contact us"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && addForm()}
              style={{ flex: 1 }}
            />
            <Tooltip label={capReason ?? ""} disabled={!capReason} withArrow>
              <Button
                leftSection={<Plus size={15} />}
                onClick={addForm}
                loading={creating}
                disabled={Boolean(capReason)}
              >
                New form
              </Button>
            </Tooltip>
          </Group>
        </Card>
      )}

      <Card withBorder radius="lg" padding={0}>
        {isLoading ? (
          <Center py="xl"><Loader size="sm" /></Center>
        ) : !forms || forms.length === 0 ? (
          <Center py="xl" mih={140}>
            <Stack align="center" gap={4}>
              <ThemeIcon variant="light" color="gray" size="md" radius="md"><Inbox size={16} /></ThemeIcon>
              <Text c="dimmed" size="xs">No forms yet — create one above.</Text>
            </Stack>
          </Center>
        ) : (
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Fields</Table.Th>
                <Table.Th>Updated</Table.Th>
                <Table.Th w={40} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {forms.map((f) => (
                <Table.Tr
                  key={f.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/app/forms/${f.id}/edit`)}
                >
                  <Table.Td>
                    <Text fw={600} size="sm">{f.name}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="sm" variant="light" color={STATUS_COLOR[f.status]}>
                      {f.status}
                    </Badge>
                    {f.underReview && (
                      <Badge size="sm" variant="light" color="orange" ml={6}>under review</Badge>
                    )}
                  </Table.Td>
                  <Table.Td><Text size="sm" c="dimmed">{f.fields.length}</Text></Table.Td>
                  <Table.Td><Text size="sm" c="dimmed">{new Date(f.updatedAt).toLocaleDateString()}</Text></Table.Td>
                  <Table.Td onClick={(e) => e.stopPropagation()}>
                    <Tooltip label="Delete form" withArrow>
                      <ActionIcon variant="subtle" color="red" size="sm" onClick={() => del(f.id, f.name)}>
                        <Trash2 size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>
    </Stack>
  );
}
